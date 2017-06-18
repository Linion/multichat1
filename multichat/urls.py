from django.conf.urls import url
from django.contrib import admin
from django.contrib.auth.views import login, logout
from chat import views

urlpatterns = [
    url(r'^$', views.index),
    url(r'^admin/', admin.site.urls),
    #auth user
    url(r'^login$', views.login_page, name="login_page"),
    url(r'^login_user$', views.login_user, name="login"),
    url(r'^logout$', views.logout_user, name="logout"),
    url(r'^reg$', views.reg_page, name="reg_page"),
    url(r'^reg_user$', views.reg_user, name="reg"),
]
