from django.http import HttpResponse, JsonResponse
import os
from youtube_transcript_api import YouTubeTranscriptApi
from django.views.decorators.csrf import csrf_exempt
import json
from llama_index import SimpleDirectoryReader, GPTSimpleVectorIndex, LLMPredictor, ServiceContext

from langchain import OpenAI
import youtube_dl
from youtube_dl import YoutubeDL
import whisper
os.environ["OPENAI_API_KEY"] = "Your API key here"

transcript = []

@csrf_exempt
def get_transcript(request):
    global transcript
    transcript=[]
    data = json.loads(request.body)
    url = data['url']
    isPlaylist = data['isPlaylist']
    if not isPlaylist:
        folder_path = "snapsum/docs/"  # To Remove previous files

        for filename in os.listdir(folder_path):
            file_path = os.path.join(folder_path, filename)
            if os.path.isfile(file_path):
                os.remove(file_path)
        
        folder_path = "snapsum/transcript/"  # To Remove previous files

        for filename in os.listdir(folder_path):
            file_path = os.path.join(folder_path, filename)
            if os.path.isfile(file_path):
                os.remove(file_path)
    t, f = _transcript(url)
    transcript.extend([t, f])
    _construct_index("snapsum/docs")
    transcript_json = json.dumps(transcript)
    return HttpResponse(transcript_json)

@csrf_exempt
def get_transcript_from_audio(request):
    data = json.loads(request.body)
    url = data['url']
    id = get_video_id(url)
    model = whisper.load_model("base")

    options = {
        'format': 'bestaudio',
        'outtmpl': f'{id}.m4a',
    }
    audio_downloader = YoutubeDL(options)
    audio_downloader.extract_info(url)
    result = model.transcribe(f"{id}.m4a")
    return HttpResponse(result["text"])

def get_video_id(url):
    return url.split("=")[-1]

def _construct_index(directory_path):
    num_outputs = 2048
    llm_predictor = LLMPredictor(llm=OpenAI(temperature=0.0, model_name="gpt-3.5-turbo-0125", max_tokens=num_outputs))
    service_context = ServiceContext.from_defaults(llm_predictor=llm_predictor)
    docs = SimpleDirectoryReader(directory_path).load_data()
    index = GPTSimpleVectorIndex.from_documents(docs, service_context=service_context)
    index.save_to_disk('index.json')
    return index

def get_summary(request):
    index = GPTSimpleVectorIndex.load_from_disk('index.json')
    response = index.query("Give summary in detail")                    
    return HttpResponse(response.response)

@csrf_exempt
def answer_the_question(request):   
    data = json.loads(request.body)
    ans_file = ""
    question = data['question']
    isplaylist = data['isPlaylist']
    index = GPTSimpleVectorIndex.load_from_disk('index.json')
    ans = str(index.query( question)).strip()
    text = str(index.query("Is the answer of "+ question +" is mentioned? yes or no. If yes then give me the exact line of text from where you got the answer")).strip()
    if text.strip().startswith("Yes"):
        if isplaylist:
            path = "snapsum/transcript/"
            for filename in os.listdir(path):
                ans_file = filename
                with open(path+filename, 'r') as f:
                    s = json.load(f)
                print(type(s))
                time = get_time_form_text(s,  ' '.join(str(text).split("\"")[1][:-1].split()[:7]))
                if time != -1:
                    break
        else:
            print('hit........')
            time = get_time_form_text(transcript[:-1][0],  ' '.join(str(text).split("\"")[1][:-1].split()[:7]))
    else:
        time = -1
    return HttpResponse(JsonResponse({"answer": ans,"ref_time": time, "video_id": ans_file.split('.txt')[0]}, safe=False)) if isplaylist else HttpResponse(JsonResponse({"answer": ans, "ref_time": time}, safe=False))

@csrf_exempt
def get_playlist(request):
    data = json.loads(request.body)
    playlist_url = data['playlist_url']
    ydl_opts = {'extract_flat': 'in_playlist',
                'skip_download': True,
                'playlist_items': '1-10000'}
    
    folder_path = "snapsum/docs/"  # To Remove previous files
    
    for filename in os.listdir(folder_path):
        print(filename)
        file_path = os.path.join(folder_path, filename)
        if os.path.isfile(file_path):
            os.remove(file_path)
    folder_path = "snapsum/transcript/"  # To Remove previous files
    
    for filename in os.listdir(folder_path):
        print(filename)
        file_path = os.path.join(folder_path, filename)
        if os.path.isfile(file_path):
            os.remove(file_path)


    print("=========================================================================================")
    with youtube_dl.YoutubeDL(ydl_opts) as ydl:
        playlist_dict = ydl.extract_info(playlist_url, download=False)
        print(playlist_dict)
        video_ids_and_titles = [{"id": video['id'],"title": video['title']} for video in playlist_dict['entries']]

    print(video_ids_and_titles)

    for i in video_ids_and_titles:
        url = "https://www.youtube.com/watch?v=" + i['id']
        _transcript(url)
    
    _construct_index("snapsum/docs")
    return HttpResponse("Done")

@csrf_exempt
def get_video_list(request):
    data = json.loads(request.body)
    playlist_url = data['playlist_url']
    ydl_opts = {'extract_flat': 'in_playlist',
                'skip_download': True,
                'playlist_items': '1-10000'}
    with youtube_dl.YoutubeDL(ydl_opts) as ydl:
        playlist_dict = ydl.extract_info(playlist_url, download=False)
        video_ids_and_titles = [{"id": video['id'],"title": video['title']} for video in playlist_dict['entries']]
    return HttpResponse(JsonResponse(video_ids_and_titles, safe=False))
    

def _transcript(url):
    os.mkdir("snapsum/docs") if not os.path.exists("snapsum/docs") else None
    os.mkdir("snapsum/transcript") if not os.path.exists("snapsum/transcript") else None
    try:
        transcript = YouTubeTranscriptApi.get_transcript(get_video_id(url))
        print(transcript)
        s = " ".join([i["text"] for i in transcript])
        id=get_video_id(url)
        filename = f"snapsum/docs/{id}.txt"
        f = open(filename, "w")
        f.write(s)
        transcript_file = f"snapsum/transcript/{id}.txt"
        file = open(transcript_file, "w")
        json.dump(transcript, file)

        return (transcript, True)
    except Exception as e:
        print(e)
        os.mkdir("snapsum/audios") if not os.path.exists("snapsum/audios") else None
        id = get_video_id(url)
        model = whisper.load_model("base")

        options = {
            'format': 'bestaudio',
            'outtmpl': f'snapsum/audios/{id}.m4a',
        }
        audio_downloader = YoutubeDL(options)
        audio_downloader.extract_info(url)
        transcript =  get_transcript_without_caption(f"snapsum/audios/{id}.m4a")
        s = " ".join([i["text"] for i in transcript])
        id=get_video_id(url)
        filename = f"snapsum/docs/{id}.txt"
        f = open(filename, "w")
        f.write(s)
        transcript_file = f"snapsum/transcript/{id}.txt"
        file = open(transcript_file, "w")
        file.write(str(transcript))
        return (transcript, False)

def get_transcript_without_caption(filename):
    # Load the Whisper model
    model = whisper.load_model("base")
    
    # Transcribe the audio file
    result = model.transcribe(filename)

    # Extract the text and timestamps from the result
    text = result["text"]
    segments = result["segments"]
    
    # Create a list of dictionaries with the text, start time, and duration for each word
    transcript_list = []
    for segment in segments:
        text = segment["text"]
        start_time = segment["start"]
        end_time = segment["end"]
        transcript_list.append({"text": text, "start": start_time, "duration": end_time - start_time})
        
    # time = get_time_form_text(transcript)
    return transcript_list

def get_time_form_text(transcript, text_to_find:str):
    print(transcript, type(transcript))
    print("=======================================================")
    print(text_to_find, type(text_to_find))
    s = ' '.join([i["text"] for i in transcript])
    index = s.lower().find(text_to_find.lower())
    if index == -1:
        return -1
    else:
        time = 0
        current_index = 0
        for i in transcript:
            if current_index + len(i["text"]) > index:
                time  = i["start"]
                break
            current_index += len(i["text"])+1
    return time
