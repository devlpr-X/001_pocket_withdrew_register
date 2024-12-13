from django.urls import path
from appbackend import views, transaction, edituser, category

urlpatterns = [
    path('user/', views.checkService), # localhost:8000/user/ gehed views.checkService function duudna.
    path('useredit/', edituser.editcheckService), # localhost:8000/useredit/ gehed edituser.editcheckService function duudna.  
    path('transaction/', transaction.transactioncheckService, name="transaction"), # localhost:8000/useredit/ gehed edituser.editcheckService function duudna.  
    path('category/', category.categorycheckService), # localhost:8000/useredit/ gehed edituser.editcheckService function duudna.  
]
