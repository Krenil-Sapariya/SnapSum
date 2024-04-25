"""
URL configuration for snapsum project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/dev/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from .views import get_summary, get_transcript, answer_the_question,get_playlist,get_video_list,get_transcript_from_audio
urlpatterns = [
    path('admin/', admin.site.urls),

    # write code which sets path to hello function
    path('transcript/', get_transcript),
    path('summary/', get_summary),
    path('answer/', answer_the_question),
    path('playlist/', get_playlist),
    path('video-list/', get_video_list),
    path('transcript-audio/',get_transcript_from_audio)
]