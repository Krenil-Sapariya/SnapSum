import youtube_dl
playlist_url = 'https://www.youtube.com/watch?v=QFaFIcGhPoM&list=PLC3y8-rFHvwgg3vaYJgHGnModB54rxOk3'
ydl_opts = {'extract_flat': 'in_playlist',
            'skip_download': True,
            'playlist_items': '1-10000'}
with youtube_dl.YoutubeDL(ydl_opts) as ydl:
    playlist_dict = ydl.extract_info(playlist_url, download=False)
    video_urls = [video['url'] for video in playlist_dict['entries']]
print(video_urls)