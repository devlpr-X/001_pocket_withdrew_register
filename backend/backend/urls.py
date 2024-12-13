from django.urls import path
from appbackend import views, edituser,  detailviews

urlpatterns = [
    path('user/', views.checkService), # localhost:8000/user/ gehed views.checkService function duudna.
    path('useredit/', edituser.editcheckService), # localhost:8000/useredit/ gehed edituser.editcheckService function duudna.
    path('userdetail/', detailviews.detailcheckService), # localhost:8000/useredit/ gehed edituser.editcheckService function duudna.
    
]
