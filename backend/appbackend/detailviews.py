from django.http.response import JsonResponse
from django.shortcuts import render
from datetime import datetime
from django.http import JsonResponse
import json
from django.views.decorators.csrf import csrf_exempt
from backend.settings import sendMail, sendResponse ,disconnectDB, connectDB, resultMessages,generateStr

#get skill info
def dt_getskillinfo(request):
    jsons = json.loads(request.body)
    action = jsons['action'] 
    try:
        uid = jsons['uid']
    except: 
        action = jsons['action']
        respdata = []
        resp = sendResponse(request, 3024, respdata, action) 
        return resp
    
    try: 
        myConn = connectDB() 
        cursor = myConn.cursor() 
        
        query = F"""UPDATE t_user SET fname = '{fname}',
                    INNER JOIN 
                    lname = '{lname}' WHERE uid = {uid}""" 
        #print(query)
        cursor.execute(query) # executing query
        myConn.commit()
        
        # UPDATE hiisnii daraa tuhain hereglegchiin medeelliig select hiij baina.
        query = F"""SELECT uname, fname, lname, uid FROM t_user
                    WHERE uid = {uid}""" 
        
        cursor.execute(query) # executing query
        columns = cursor.description #
        respRow = [{columns[index][0]:column for index, 
            column in enumerate(value)} for value in cursor.fetchall()] # respRow is list and elements are dictionary. dictionary structure is columnName : value
        cursor.close() # close the cursor. ALWAYS
        uid = respRow[0]['uid']
        uname = respRow[0]['uname']
        fname = respRow[0]['fname']
        lname = respRow[0]['lname']
        respdata = [{'uid': uid,'uname':uname , 'fname':fname, 'lname':lname}] # creating response logged user information
        resp = sendResponse(request, 1005, respdata, action) # response beldej baina. 6 keytei.
    except:
        # edituser service deer aldaa garval ajillana. 
        action = jsons["action"]
        respdata = [] # hooson data bustaana.
        resp = sendResponse(request, 5007, respdata, action) # standartiin daguu 6 key-tei response butsaana
        
    finally:
        disconnectDB(myConn) # yamarch uyd database holbolt uussen bol holboltiig salgana. Uchir ni finally dotor baigaa
        return resp # response bustaaj baina
#dt_getalluser

@csrf_exempt # method POST uyd ajilluulah csrf
def detailcheckService(request): # hamgiin ehend duudagdah request shalgah service
    if request.method == "POST": # Method ni POST esehiig shalgaj baina
        try:
            # request body-g dictionary bolgon avch baina
            jsons = json.loads(request.body)
        except:
            # request body json bish bol aldaanii medeelel butsaana. 
            action = "no action"
            respdata = [] # hooson data bustaana.
            resp = sendResponse(request, 3003, respdata) # standartiin daguu 6 key-tei response butsaana
            return JsonResponse(resp) # response bustaaj baina
            
        try: 
            #jsons-s action-g salgaj avch baina
            action = jsons["action"]
        except:
            # request body-d action key baihgui bol aldaanii medeelel butsaana. 
            action = "no action"
            respdata = [] # hooson data bustaana.
            resp = sendResponse(request, 3005, respdata,action) # standartiin daguu 6 key-tei response butsaana
            return JsonResponse(resp)# response bustaaj baina
        
        # request-n action ni getalluserinfo
        if action == "getallskillinfo":
            result = dt_getskillinfo(request)
            return JsonResponse(result)
        else:
            action = "no action"
            respdata = []
            resp = sendResponse(request, 3001, respdata, action)
            return JsonResponse(resp)
    
    # Method ni POST bish bol ajillana
    else:
        #GET, POST-s busad uyd ajillana
        action = "no action"
        respdata = []
        resp = sendResponse(request, 3002, respdata, action)
        return JsonResponse(resp)
