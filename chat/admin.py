from django.contrib import admin
from .models import Room, Message, Member


class RoomAdmin(admin.ModelAdmin):
    list_display=('id', 'title')
    list_display_links = ('id', 'title')
    pass
class MessageAdmin(admin.ModelAdmin):
    list_display = ('id', 'room', 'user', 'message', 'msg_type', 'time')
    pass
class MemberAdmin(admin.ModelAdmin):
    list_display = ('room', 'user')
    pass
admin.site.register(Room, RoomAdmin)
admin.site.register(Message, MessageAdmin)
admin.site.register(Member, MemberAdmin)