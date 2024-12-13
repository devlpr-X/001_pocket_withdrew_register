from django.http.response import JsonResponse
from django.shortcuts import render
from datetime import datetime
from django.http import JsonResponse
import json
from django.views.decorators.csrf import csrf_exempt
from backend.settings import sendMail, sendResponse ,disconnectDB, connectDB, resultMessages,generateStr

#register category
def dt_registcategory(request):
    jsons = json.loads(request.body) # get request body
    action = jsons['action'] # get action key from jsons
    # print(action)
    
    # url: http://localhost:8000/category/
    # Method: POST
    # Body: raw JSON
    
    # request body:
    # {
    #     "action": "registcategory",
    #     "uid": 54,
    #     "categoryname": "Хоол хүнс",
    #     "transctiontype": 1,
    # }
    
    try:
        uid = jsons['uid']
        categoryname = jsons['categoryname']
        transactiontype = jsons['transactiontype']
    except: # uid, fname, lname key ali neg ni baihgui bol aldaanii medeelel butsaana
        action = jsons['action']
        respdata = []
        resp = sendResponse(request, 3035, respdata, action) # response beldej baina. 6 keytei.
        return resp
    
    try: 
        myConn = connectDB() # database holbolt uusgej baina
        cursor = myConn.cursor() # cursor uusgej baina
        query = F"""SELECT COUNT(id) AS categorycount 
                    , MIN(id) AS id
                    , MIN(uid) AS uid
                    , MIN(name) AS name
                    , MIN(transactiontype) AS transactiontype
                    , MIN(createddate) AS createddate
                    , MIN(updateddate) AS updateddate 
                    FROM t_category
                    WHERE uid = {uid} AND name = '{categoryname}' AND transactiontype = {transactiontype} """ 
        
        cursor.execute(query) # executing query
        columns = cursor.description #
        respRow = [{columns[index][0]:column for index, 
            column in enumerate(value)} for value in cursor.fetchall()] # respRow is list and elements are dictionary. dictionary structure is columnName : value
        cursor.close() # close the cursor. ALWAYS
        if respRow[0]['categorycount'] == 1: # Umnu ni burgesen category baigaa uchir medeelliin ilgeene
            respdata = respRow 
            resp = sendResponse(request, 3034, respdata, action) # response beldej baina. 6 keytei.
        else:
            cursor = myConn.cursor() # cursor uusgej baina
            query = F"""INSERT INTO t_category(
                        uid, name, transactiontype, createddate)
                        VALUES ( {uid}, '{categoryname}', {transactiontype}, now())
                        RETURNING id""" 
            
            cursor.execute(query) # executing cursor1
            myConn.commit() # updating database
            id = cursor.fetchone()[0] # Returning newly inserted (id)
            
            query = F"""SELECT id, uid, name, transactiontype, createddate, updateddate 
                    FROM t_category
                    WHERE id = {id}""" 
            cursor.execute(query) # executing query
            columns = cursor.description #
            respRow = [{columns[index][0]:column for index, 
                column in enumerate(value)} for value in cursor.fetchall()] # respRow is list and elements are dictionary. dictionary structure is columnName : value
            cursor.close() # close the cursor. ALWAYS
            respdata = respRow # creating response category
            resp = sendResponse(request, 1015, respdata, action) # response beldej baina. 6 keytei.
    except Exception as e:
        print(e)
        # dt_registcategory service deer aldaa garval ajillana. 
        action = jsons["action"]
        respdata = [] # hooson data bustaana.
        resp = sendResponse(request, 5016, respdata, action) # standartiin daguu 6 key-tei response butsaana
        
    finally:
        disconnectDB(myConn) # yamarch uyd database holbolt uussen bol holboltiig salgana. Uchir ni finally dotor baigaa
        return resp # response bustaaj baina
#dt_registcategory

#edit category
def dt_editcategory(request):
    jsons = json.loads(request.body) # get request body
    action = jsons['action'] # get action key from jsons
    # print(action)
    
    # url: http://localhost:8000/category/
    # Method: POST
    # Body: raw JSON
    
    # request body:
    # {
    #     "action": "editcategory",
    #     "id": 1,
    #     "uid": 54,
    #     "categoryname": "Хоол хүнс",
    #     "transctiontype": 1
    # }
    
    try:
        id = jsons['id']
        uid = jsons['uid']
        categoryname = jsons['categoryname']
        transactiontype = jsons['transactiontype']
    except: # uid, fname, lname key ali neg ni baihgui bol aldaanii medeelel butsaana
        action = jsons['action']
        respdata = []
        resp = sendResponse(request, 3036, respdata, action) # response beldej baina. 6 keytei.
        return resp
    
    try: 
        myConn = connectDB() # database holbolt uusgej baina
        cursor = myConn.cursor() # cursor uusgej baina
        query = F"""SELECT COUNT(id) AS categorycount 
                    , MIN(id) AS id
                    , MIN(uid) AS uid
                    , MIN(name) AS name
                    , MIN(transactiontype) AS transactiontype
                    , MIN(createddate) AS createddate
                    , MIN(updateddate) AS updateddate 
                    FROM t_category
                    WHERE id = {id} AND uid = {uid}""" 
        
        cursor.execute(query) # executing query
        columns = cursor.description #
        respRow = [{columns[index][0]:column for index, 
            column in enumerate(value)} for value in cursor.fetchall()] # respRow is list and elements are dictionary. dictionary structure is columnName : value
        cursor.close() # close the cursor. ALWAYS
        if respRow[0]['categorycount'] == 1: # Umnu ni burgesen category baigaa uchir medeelliin uurchilnu
            # Update query
            cursor = myConn.cursor() # cursor uusgej baina
            query = F"""UPDATE t_category 
                        SET  uid={uid}, name='{categoryname}', transactiontype={transactiontype}, updateddate=now() 
                        WHERE id={id};""" 
            
            cursor.execute(query) # executing cursor1
            myConn.commit() # updating database

            # Select query, take updated informaiton
            query = F"""SELECT id, uid, name, transactiontype, createddate, updateddate 
                    FROM t_category
                    WHERE id = {id}""" 
            cursor.execute(query) # executing query
            columns = cursor.description #
            respRow = [{columns[index][0]:column for index, 
                column in enumerate(value)} for value in cursor.fetchall()] # respRow is list and elements are dictionary. dictionary structure is columnName : value
            cursor.close() # close the cursor. ALWAYS
            respdata = respRow 
            resp = sendResponse(request, 1007, respdata, action) # response beldej baina. 6 keytei.
        else:
            respdata = [{ "action": action, "id": id, "uid": uid, "categoryname": categoryname, "transctiontype": transactiontype}] # creating response category
            resp = sendResponse(request, 3027, respdata, action) # response beldej baina. 6 keytei.
    except:
        # editcategory service deer aldaa garval ajillana. 
        action = jsons["action"]
        respdata = [] # hooson data bustaana.
        resp = sendResponse(request, 5017, respdata, action) # standartiin daguu 6 key-tei response butsaana
        
    finally:
        disconnectDB(myConn) # yamarch uyd database holbolt uussen bol holboltiig salgana. Uchir ni finally dotor baigaa
        return resp # response bustaaj baina
#dt_editcategory
    
#getall category
def dt_getallcategory(request):
    jsons = json.loads(request.body) # get request body
    action = jsons['action'] # get action key from jsons
    # print(action)
    
    # url: http://localhost:8000/category/
    # Method: POST
    # Body: raw JSON
    
    # request body:
    # {
    #     "action": "getallcategory",
    #     "uid": 54
    # }
    
    try:
        uid = jsons['uid']
    except: # uid, fname, lname key ali neg ni baihgui bol aldaanii medeelel butsaana
        action = jsons['action']
        respdata = []
        resp = sendResponse(request, 3028, respdata, action) # response beldej baina. 6 keytei.
        return resp
    
    try: 
        myConn = connectDB() # database holbolt uusgej baina
        cursor = myConn.cursor() # cursor uusgej baina
        query = F"""SELECT c.id, uid, c.name AS categoryname, c.id AS categoryid, t.name AS  transactiontypename, t.id AS  transactiontypeid, createddate, updateddate 
                    FROM t_category c
                    INNER JOIN t_transactiontype t
                    ON c.transactiontype = t.id
                    WHERE uid = {uid} 
                    ORDER BY createddate DESC """ 
        cursor.execute(query) # executing query
        columns = cursor.description #
        respRow = [{columns[index][0]:column for index, 
            column in enumerate(value)} for value in cursor.fetchall()] # respRow is list and elements are dictionary. dictionary structure is columnName : value
        cursor.close() # close the cursor. ALWAYS
        respdata = respRow 
        resp = sendResponse(request, 1008, respdata, action) # response beldej baina. 6 keytei.
    except:
        # dt_getallcategory service deer aldaa garval ajillana. 
        action = jsons["action"]
        respdata = [] # hooson data bustaana.
        resp = sendResponse(request, 5010, respdata, action) # standartiin daguu 6 key-tei response butsaana
        
    finally:
        disconnectDB(myConn) # yamarch uyd database holbolt uussen bol holboltiig salgana. Uchir ni finally dotor baigaa
        return resp # response bustaaj baina
#dt_getallcategory


#delete category
def dt_deletecategory(request):
    jsons = json.loads(request.body) # get request body
    action = jsons['action'] # get action key from jsons
    # print(action)
    
    # url: http://localhost:8000/category/
    # Method: POST
    # Body: raw JSON
    
    # request body:
    # {
    #     "action": "deletecategory",
    #     "id": 1,
    # }
    
    try:
        id = jsons['id']
    except: # uid, fname, lname key ali neg ni baihgui bol aldaanii medeelel butsaana
        action = jsons['action']
        respdata = []
        resp = sendResponse(request, 3029, respdata, action) # response beldej baina. 6 keytei.
        return resp
    
    try: 
        myConn = connectDB() # database holbolt uusgej baina
        cursor = myConn.cursor() # cursor uusgej baina
        # Update query
        cursor = myConn.cursor() # cursor uusgej baina
        query = F""" DELETE FROM t_category  WHERE id={id} """ 
        cursor.execute(query) # executing cursor1
        myConn.commit() # updating database
        cursor.close() # close the cursor. ALWAYS
        respdata = []
        resp = sendResponse(request, 1009, respdata, action) # response beldej baina. 6 keytei.
    except Exception as e:
        print(e)
        # dt_deletecategory service deer aldaa garval ajillana. 
        action = jsons["action"]
        respdata = [] # hooson data bustaana.
        resp = sendResponse(request, 5011, respdata, action) # standartiin daguu 6 key-tei response butsaana
        
    finally:
        disconnectDB(myConn) # yamarch uyd database holbolt uussen bol holboltiig salgana. Uchir ni finally dotor baigaa
        return resp # response bustaaj baina
#dt_deletecategory
    
 
@csrf_exempt # method POST uyd ajilluulah csrf
def categorycheckService(request): # hamgiin ehend duudagdah request shalgah service
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
        
        # request-n action ni gettime
        if action == "registcategory":
            result = dt_registcategory(request)
            return JsonResponse(result)
        if action == "getallcategory":
            result = dt_getallcategory(request)
            return JsonResponse(result)
        if action == "editcategory":
            result = dt_editcategory(request)
            return JsonResponse(result)
        if action == "deletecategory":
            result = dt_deletecategory(request)
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
