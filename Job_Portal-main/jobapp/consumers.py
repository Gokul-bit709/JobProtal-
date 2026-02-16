import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from .models import Conversation, Message

User = get_user_model()

class JobChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        
        pass
    
    async def receive(self, text_data):
       
        data = json.loads(text_data)
        message_content = data.get('message')
        receiver_id = data.get('receiver_id')
        
        if not message_content or not receiver_id:
            return
        
       
        can_send = await self.check_can_send_message(receiver_id)
        
        if not can_send:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Only employers can start new conversations. Jobseekers can only reply to existing conversations.'
            }))
            return
        
       
        message = await self.save_message(receiver_id, message_content)
        
        
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message_id': message.id,
                'message': message_content,
                'sender': self.user.username,
                'sender_id': self.user.id,
                'sender_type': self.user.user_type,
                'receiver_id': receiver_id,
                'timestamp': str(message.timestamp)
            }
        )
    
    @database_sync_to_async
    def check_can_send_message(self, receiver_id):
      
        try:
            receiver = User.objects.get(id=receiver_id)
            
            
            conversation = Conversation.objects.filter(
                participants=self.user
            ).filter(
                participants=receiver
            ).first()
            
            if not conversation:
             
                return self.user.user_type == 'employer'
            else:
                
                if self.user.user_type == 'jobseeker':
                   
                    return conversation.jobseeker_can_reply
                else:
                    
                    return True
                    
        except User.DoesNotExist:
            return False
    
    @database_sync_to_async
    def save_message(self, receiver_id, content):
        
        receiver = User.objects.get(id=receiver_id)
        
        
        conversation = Conversation.objects.filter(
            participants=self.user
        ).filter(
            participants=receiver
        ).first()
        
        if not conversation:
            conversation = Conversation.objects.create()
            conversation.participants.add(self.user, receiver)
            
            
            if self.user.user_type == 'employer':
                conversation.initiated_by = self.user
                conversation.save()
        
       
        message = Message.objects.create(
            conversation=conversation,
            sender=self.user,
            receiver=receiver,
            content=content
        )
        
        return message