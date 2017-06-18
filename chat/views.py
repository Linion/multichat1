from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from .models import Room
from django.contrib.auth import authenticate, login, logout
from django.template import loader
from django.http import HttpResponse
from django.shortcuts import redirect
from django.contrib.auth.models import User

#auth user
def login_page(request):
    template = loader.get_template('chat/templates/login.html')
    context = {
        "next":request.GET['next']
    }
    if request.user.is_authenticated():
        return redirect(request.GET['next'])
    else:
        return HttpResponse(template.render(context, request))

def login_user(request):
    user = authenticate(username=request.POST['username'], password=request.POST['password'])
    print request.POST['username']
    if user is not None:
        login(request, user)
        return redirect(request.POST['next'])
    else:
        return HttpResponse("failed")

@login_required
def logout_user(request):
    logout(request)
    return redirect('./')
def reg_page(request):
    template = loader.get_template('chat/templates/reg.html')
    context = {
        
    }
    return HttpResponse(template.render(context, request))
def reg_user(request):
    user = User(username=request.POST['username'], first_name=request.POST['first_name'], last_name=request.POST['last_name'])
    user.set_password(request.POST['password'])
    user.save()
    if user is not None:
        login(request, user)
        return redirect('./')
    else:
        return HttpResponse("failed")

@login_required
def index(request):
    template = loader.get_template('chat/templates/mainpage.html')
    rooms = Room.objects.order_by("title")
    context = {
        "rooms": rooms
    }
    return HttpResponse(template.render(context, request))
