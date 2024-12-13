from django.http.response import JsonResponse
from django.shortcuts import render
from datetime import datetime 
from django.http import JsonResponse
import json
from django.views.decorators.csrf import csrf_exempt
from backend.settings import sendMail, sendResponse ,disconnectDB, connectDB, resultMessages,generateStr

# Odoogiin tsagiig duuddag service
def dt_gettime(request):
    jsons = json.loads(request.body) 
    action = jsons["action"] 
    respdata = [{'time1':datetime.now().strftime("%Y/%m/%d, %H:%M:%S")}] 
    resp = sendResponse(request, 200, respdata, action)
    return resp
# dt_gettime

#edit user
def dt_edituser(request):
    jsons = json.loads(request.body) # get request body
    action = jsons['action'] # get action key from jsons[]
    try:
        uid = jsons['uid']
        fname = jsons['fname'].capitalize()
        lname = jsons['lname'].capitalize()
    except: 
        action = jsons['action']
        respdata = []
        resp = sendResponse(request, 3024, respdata, action) # response beldej baina. 6 keytei.
        return resp
    
    try: 
        myConn = connectDB() # database holbolt uusgej baina
        cursor = myConn.cursor() # cursor uusgej baina
        
        # uid-r hailt hiij fname, lname update hiij baina.
        query = F"""UPDATE t_user SET fname = '{fname}',
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
#dt_edituser

#Get User Resume
def dt_getuserresume(request):
    jsons = json.loads(request.body) # get request body
    action = jsons['action'] # get action key from jsons
    # print(action)
    
    try:
        uid = jsons['uid']
    except: # uid key ali neg ni baihgui bol aldaanii medeelel butsaana
        action = jsons['action']
        respdata = []
        resp = sendResponse(request, 3025, respdata, action) # response beldej baina. 6 keytei.
        return resp
    
    try: 
        myConn = connectDB() # database holbolt uusgej baina
        cursor = myConn.cursor() # cursor uusgej baina
        
        # uid-r hailt hiij uid, uname, fname, lname select hiij baina.
        query = F"""SELECT uid, uname, fname, lname 
                    FROM t_user WHERE uid={uid}""" 
        #print(query)
        cursor.execute(query) # executing query
        columns = cursor.description #
        respRow = [{columns[index][0]:column for index, 
            column in enumerate(value)} for value in cursor.fetchall()]
        uid = respRow[0]['uid']
        uname = respRow[0]['uname']
        fname = respRow[0]['fname']
        lname = respRow[0]['lname']
        
        # uid-r hailt hiij uid, skillname, level, skillid select hiij baina.
        query = F"""SELECT uid, skillname, level, id
                FROM t_skill WHERE uid={uid}""" 
        #print(query)
        cursor.execute(query) # executing query
        columns = cursor.description #
        respRow = [{columns[index][0]:column for index, 
            column in enumerate(value)} for value in cursor.fetchall()] 
        skills=respRow
        
        # uid-r hailt hiij educationid, school, degree, city, description, uid, startdate, enddate select hiij baina.
        query = F"""SELECT educationid, school, degree, city,           
                            description, uid, startdate, enddate
                FROM t_education WHERE uid={uid}""" 
        #print(query)
        cursor.execute(query) # executing query
        columns = cursor.description #
        respRow = [{columns[index][0]:column for index, 
            column in enumerate(value)} for value in cursor.fetchall()] # respRow is list and elements are dictionary. dictionary structure is columnName : value
        education=respRow
        # print(respRow)
        
        query = F"""SELECT id, uid, language, level 
                FROM t_languages WHERE uid={uid}""" 
        # #print(query)
        cursor.execute(query) # executing query
        columns = cursor.description #
        respRow = [{columns[index][0]:column for index, 
            column in enumerate(value)} for value in cursor.fetchall()] # respRow is list and elements are dictionary. dictionary structure is columnName : value
        languages = respRow
        # # print(respRow)

        # uid-r hailt hiij educationid, school, degree, city, description, uid, startdate, enddate select hiij baina.
        query = F"""SELECT id, uid, course,           
                            institution, startdate, enddate
                FROM t_courses WHERE uid={uid}""" 
        #print(query)
        cursor.execute(query) # executing query
        columns = cursor.description #
        respRow = [{columns[index][0]:column for index, 
            column in enumerate(value)} for value in cursor.fetchall()] # respRow is list and elements are dictionary. dictionary structure is columnName : value
        courses=respRow
        # print(respRow)

        # # uid-r hailt hiij educationid, school, degree, city, description, uid, startdate, enddate select hiij baina.
        # query = F"""SELECT educationid, school, degree, city,           
        #                     description, uid, startdate, enddate
        #         FROM t_education WHERE uid={uid}""" 
        # #print(query)
        # cursor.execute(query) # executing query
        # columns = cursor.description #
        # respRow = [{columns[index][0]:column for index, 
        #     column in enumerate(value)} for value in cursor.fetchall()] # respRow is list and elements are dictionary. dictionary structure is columnName : value
        # education=respRow
        # # print(respRow)
        
        cursor.close() 
        respdata = [{'uid': uid,'uname':uname , 'fname':fname, 'lname':lname, 'skills':skills, 'education':education, "languages": languages, "courses": courses}] # creating response user resume information
        resp = sendResponse(request, 1006, respdata, action) # response beldej baina. 6 keytei.
    except:
        action = jsons["action"]
        respdata = [] # hooson data bustaana.
        resp = sendResponse(request, 5008, respdata, action) # standartiin daguu 6 key-tei response butsaana
        
    finally:
        disconnectDB(myConn) 
        return resp 
#dt_getuserresume

def dt_getalluser(request):
    jsons = json.loads(request.body) # get request body
    action = jsons['action'] # get action key from jsons
    print(jsons)
    
    try:
        uid1 = 1
    except: # Ene service deer nemelteer key-uud baij ch bolno, baihgui ch bolno
        action = jsons['action']
        respdata = []
        resp = sendResponse(request, 3026, respdata, action) # response beldej baina. 6 keytei.
        return resp
    
    try: 
        myConn = connectDB() # database holbolt uusgej baina
        cursor = myConn.cursor() # cursor uusgej baina
        
        # Hervee isverified key request body dotor baival nemelt isverified nuhtsuluur nemelt hailt hiine. 
        isverifiedQuery = ""
        if "isverified" in jsons:
            isverified = jsons["isverified"]
            isverifiedQuery = F""" AND  isverified = {isverified}"""
        
        # Hervee isbanned key request body dotor baival nemelt isbanned nuhtsuluur nemelt hailt hiine. 
        isbannedQuery = ""
        if "isbanned" in jsons:
            isbanned = jsons["isbanned"]
            isbannedQuery = F""" AND  isbanned = {isbanned}"""
        
        # hailt hiij uid, uname, fname, lname, isverified, isbanned select hiij baina.
        query = F"""SELECT uid, uname, fname, lname, isverified, isbanned
                    FROM t_user WHERE 1=1 """ + isverifiedQuery + isbannedQuery
        #print(query)
        cursor.execute(query) # executing query
        columns = cursor.description #
        respRow = [{columns[index][0]:column for index, 
            column in enumerate(value)} for value in cursor.fetchall()] # respRow is list and elements are dictionary. dictionary structure is columnName : value
        
        uid = respRow[0]['uid']
        uname = respRow[0]['uname']
        fname = respRow[0]['fname']
        lname = respRow[0]['lname']
        cursor.close() # close the cursor. ALWAYS
        respdata = respRow # creating response logged user information
        resp = sendResponse(request, 1014, respdata, action) # response beldej baina. 6 keytei.
    except:
        # edituser service deer aldaa garval ajillana. 
        action = jsons["action"]
        respdata = [] # hooson data bustaana.
        resp = sendResponse(request, 5009, respdata, action) # standartiin daguu 6 key-tei response butsaana
        
    finally:
        disconnectDB(myConn) # yamarch uyd database holbolt uussen bol holboltiig salgana. Uchir ni finally dotor baigaa
        return resp # response bustaaj baina
#dt_getalluser


@csrf_exempt # method POST uyd ajilluulah csrf
def editcheckService(request): # hamgiin ehend duudagdah request shalgah service        
    # OPTIONS хүсэлт илгээсэн эсэхийг шалгах
    if request.method == "OPTIONS":
        # OPTIONS хүсэлт бол зөвхөн серверийн дэмждэг аргуудыг буцаана
        print("OPTIONS хүсэлт")
        return JsonResponse({"message": "Allowed methods: POST, GET"}, status=200)
    if request.method == "POST": # Method ni POST esehiig shalgaj baina
        print("request")
        try:
            # request body-g dictionary bolgon avch baina
            jsons = json.loads(request.body)
            print("jsons")
            print(jsons)
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
        
        # request-n action ni gettime
        if action == "gettime":
            result = dt_gettime(request)
            return JsonResponse(result)
        # request-n action ni edituser
        elif action == "edituser":
            result = dt_edituser(request)
            return JsonResponse(result)
                # request-n action ni edituser
        elif action == "getuserresume":
            print("Herooooooo")
            result = dt_getuserresume(request)
            return JsonResponse(result)
        elif action == "getalluser":
            result = dt_getalluser(request)
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
    

# @csrf_exempt
# def editcheckService(request):
#     if request.method == "POST":
#         try:
#             # Load JSON body
#             data = json.loads(request.body)
#             print("Received Data:", data)

#             # Example: If the action is 'getalluser', process accordingly
#             if data.get('action') == 'getalluser':
#                 # Simulate fetching users from the database
#                 users = [
#                     {'name': 'User1', 'uid': 1},
#                     {'name': 'User2', 'uid': 2},
#                 ]
#                 return JsonResponse({'status': 'success', 'data': users}, status=200)
#             else:
#                 return JsonResponse({'status': 'error', 'message': 'Invalid action'}, status=400)
#         except Exception as e:
#             print("Error processing request:", str(e))
#             return JsonResponse({'status': 'error', 'message': 'Server error'}, status=500)
#     return JsonResponse({'status': 'error', 'message': 'Invalid method'}, status=405)
