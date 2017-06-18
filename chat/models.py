from __future__ import unicode_literals
import json
from django.db import models
from channels import Group
from django.contrib.auth.models import User

from .settings import MSG_TYPE_MESSAGE


class Room(models.Model):
    title = models.CharField(max_length=255)
    def __unicode__(self):
        return self.title
    @property
    def websocket_group(self):
        return Group("room-%s" % self.id)

    def send_message(self, message, user, time, msg_type=MSG_TYPE_MESSAGE):
        final_msg = {
            'room': str(self.id), 
            'message': message, 
            'user': {
                'id':user.id,
                'username':user.username,
                'first_name':user.first_name,
                'last_name':user.last_name
            },
            'msg_type': msg_type,
            'time':time
        }
        self.websocket_group.send(
            {"text": json.dumps(final_msg)}
        )

class Member(models.Model):
    user = models.ForeignKey(User)
    room = models.ForeignKey(Room)

class Message(models.Model):
    room = models.ForeignKey(Room, related_name="room_messages")
    user = models.ForeignKey(User)
    message = models.CharField(max_length=255)
    msg_type = models.CharField(max_length=255)
    time = models.DateTimeField(auto_now=True)
    def __unicode__(self):
        return self.message