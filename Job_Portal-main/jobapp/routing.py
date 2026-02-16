from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    
    re_path(r'ws/jobchat/(?P<room_name>\w+)/$', consumers.JobChatConsumer.as_asgi()),
]