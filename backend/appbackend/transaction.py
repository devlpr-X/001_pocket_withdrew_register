from django.http.response import JsonResponse
from django.shortcuts import render
from datetime import datetime
from django.http import JsonResponse
import json
from django.views.decorators.csrf import csrf_exempt
from backend.settings import sendMail, sendResponse ,disconnectDB, connectDB, resultMessages,generateStr
 
#getall transaction
def dt_getalltransaction(request):
    print("Hereeeeeeeeeeeeeee")
    print(request)
    print(request.body)
    jsons = json.loads(request.body) # get request body
    action = jsons['action'] # get action key from jsons
    print(request)
    print(request.body)
    
    # url: http://localhost:8000/transaction/
    # Method: POST
    # Body: raw JSON
    
    # request body:
    # {
    #     "action": "getalltransaction",
    #     "uid": 54
    # }
    
    try:
        uid = jsons['uid']
    except: # uid, fname, lname key ali neg ni baihgui bol aldaanii medeelel butsaana
        action = jsons['action']
        respdata = []
        print("Hereeeeeeeeeeeeeee1")
        resp = sendResponse(request, 3030, respdata, action) # response beldej baina. 6 keytei.
        return resp
    
    try: 
        print(uid)
        myConn = connectDB() # database holbolt uusgej baina
        cursor = myConn.cursor() # cursor uusgej baina
        isStartDateQuery = ""
        if "istartdate" in jsons:
            isstartdate = jsons["isstartdate"]
            isStartDateQuery = F""" AND  createddate >= {isstartdate}"""

        isEndDateQuery = ""
        if "istartdate" in jsons:
            isenddate = jsons["isenddate"]
            isEndDateQuery = F""" AND  createddate <= {isenddate}"""
        
        query = F"""SELECT ei.id AS id, ei.amount AS amount, ei.description AS description, ei.createddate AS createddate,  
                    ei.updateddate AS updateddate,  t.name AS transactiontypename, t.id AS transactiontypeid, 
                    c.name AS categoryname, c.id AS categoryid 
                    FROM t_expenseincome ei 
                    INNER JOIN t_transactiontype t ON ei.transactiontype = t.id 
                    INNER JOIN t_category c ON ei.category = c.id 
                    WHERE ei.uid={uid} {isStartDateQuery} {isEndDateQuery} 
                    ORDER BY createddate DESC """ 
        cursor.execute(query) # executing query
        print(query)
        columns = cursor.description #
        respRow = [{columns[index][0]:column for index, 
            column in enumerate(value)} for value in cursor.fetchall()] # respRow is list and elements are dictionary. dictionary structure is columnName : value
        cursor.close() # close the cursor. ALWAYS
        respdata = respRow 
        print("Hereeeeeeeeeeeeeee2")
        print(respdata)
        resp = sendResponse(request, 1010, respdata, action) # response beldej baina. 6 keytei.
    except:
        # dt_getalltransaction service deer aldaa garval ajillana. 
        action = jsons["action"]
        respdata = [] # hooson data bustaana.
        print("Hereeeeeeeeeeeeeee3")
        resp = sendResponse(request, 5012, respdata, action) # standartiin daguu 6 key-tei response butsaana
        print(resp)
        
    finally:
        print(resp)
        disconnectDB(myConn) # yamarch uyd database holbolt uussen bol holboltiig salgana. Uchir ni finally dotor baigaa
        return resp # response bustaaj baina
#dt_getalltransaction
 
#regist transaction
def dt_registtransaction(request):
    jsons = json.loads(request.body) # get request body
    action = jsons['action'] # get action key from jsons
    # print(action)
    
    # url: http://localhost:8000/transaction/
    # Method: POST
    # Body: raw JSON
    
    # request body:
    # {
    #     "action": "registtransaction",
    #     "uid": 54,
    #     "amount": 500,
    #     "description": "description",
    #     "category": 1,
    #     "transactiontype": 1,
    # }
    
    try:
        uid = jsons['uid']
        amount = jsons['amount']
        description = jsons['description']
        category = jsons['category']
        createddate = jsons['createddate']
        transactiontype = jsons['transactiontype']
    except: # uid, fname, lname key ali neg ni baihgui bol aldaanii medeelel butsaana
        action = jsons['action']
        respdata = []
        resp = sendResponse(request, 3031, respdata, action) # response beldej baina. 6 keytei.
        return resp
    
    try: 
        myConn = connectDB() # database holbolt uusgej baina
        cursor = myConn.cursor() # cursor uusgej baina
        query = F"""INSERT INTO t_expenseincome(
                        uid, amount, description, createddate, category, transactiontype) 
                        VALUES ({uid}, {amount}, '{description}', '{createddate}', {category}, {transactiontype}) 
                    RETURNING id""" 
        cursor.execute(query) # executing cursor1
        myConn.commit() # updating database
        id = cursor.fetchone()[0] # Returning newly inserted (id)
        
        query = F"""SELECT ei.id AS id, ei.uid AS uid, ei.amount AS amount, ei.description AS description, ei.createddate AS createddate,  
                    ei.updateddate AS updateddate,  t.name AS transactiontypename, t.id AS transactiontypeid, 
                    c.name AS categoryname, c.id AS categoryid 
                    FROM t_expenseincome ei 
                    INNER JOIN t_transactiontype t ON ei.transactiontype = t.id 
                    INNER JOIN t_category c ON ei.category = c.id 
                    WHERE ei.id={id}""" 
        cursor.execute(query) # executing query
        columns = cursor.description #
        respRow = [{columns[index][0]:column for index, 
            column in enumerate(value)} for value in cursor.fetchall()] # respRow is list and elements are dictionary. dictionary structure is columnName : value
        cursor.close() # close the cursor. ALWAYS
        respdata = respRow 
        resp = sendResponse(request, 1011, respdata, action) # response beldej baina. 6 keytei.
    except Exception as e:
        print(str(e))
        # dt_registtransaction service deer aldaa garval ajillana. 
        action = jsons["action"]
        respdata = [] # hooson data bustaana.
        resp = sendResponse(request, 5013, respdata, action) # standartiin daguu 6 key-tei response butsaana
        
    finally:
        disconnectDB(myConn) # yamarch uyd database holbolt uussen bol holboltiig salgana. Uchir ni finally dotor baigaa
        return resp # response bustaaj baina
#dt_registtransaction
 
#edit transaction
def dt_edittransaction(request):
    jsons = json.loads(request.body) # get request body
    action = jsons['action'] # get action key from jsons
    # print(action)
    
    # url: http://localhost:8000/transaction/
    # Method: POST
    # Body: raw JSON
    
    # request body:
    # {
    #     "action": "edittransaction",
    #     "id": 1,
    #     "uid": 54,
    #     "amount": 500,
    #     "description": "description",
    #     "category": 1,
    #     "transactiontype": 1
    # }
    
    try:
        id = jsons['id']
        uid = jsons['uid']
        amount = jsons['amount']
        description = jsons['description']
        category = jsons['category']
        transactiontype = jsons['transactiontype']
    except: # uid, fname, lname key ali neg ni baihgui bol aldaanii medeelel butsaana
        action = jsons['action']
        respdata = []
        resp = sendResponse(request, 3033, respdata, action) # response beldej baina. 6 keytei.
        return resp
    
    try: 
        myConn = connectDB() # database holbolt uusgej baina
        cursor = myConn.cursor() # cursor uusgej 
        query = F"""UPDATE t_expenseincome 
                    SET uid={uid}, amount={amount}, description='{description}', updateddate=now(), category={category}, transactiontype={transactiontype}
                    WHERE id={id}""" 
        cursor.execute(query) # executing cursor1
        myConn.commit() # updating database
        
        query = F"""SELECT ei.id AS id, ei.uid AS uid, ei.amount AS amount, ei.description AS description, ei.createddate AS createddate,  
                    ei.updateddate AS updateddate,  t.name AS transactiontypename, t.id AS transactiontypeid, 
                    c.name AS categoryname, c.id AS categoryid 
                    FROM t_expenseincome ei 
                    INNER JOIN t_transactiontype t ON ei.transactiontype = t.id 
                    INNER JOIN t_category c ON ei.category = c.id 
                    WHERE ei.id={id} 
                    """ 
        cursor.execute(query) # executing query
        columns = cursor.description #
        respRow = [{columns[index][0]:column for index, 
            column in enumerate(value)} for value in cursor.fetchall()] # respRow is list and elements are dictionary. dictionary structure is columnName : value
        cursor.close() # close the cursor. ALWAYS
        respdata = respRow 
        resp = sendResponse(request, 1013, respdata, action) # response beldej baina. 6 keytei.
    except Exception as e:
        print(e)
        # edittransaction service deer aldaa garval ajillana. 
        action = jsons["action"]
        respdata = [] # hooson data bustaana.
        resp = sendResponse(request, 5015, respdata, action) # standartiin daguu 6 key-tei response butsaana
        
    finally:
        disconnectDB(myConn) # yamarch uyd database holbolt uussen bol holboltiig salgana. Uchir ni finally dotor baigaa
        return resp # response bustaaj baina
#dt_edittransaction


#delete transaction
def dt_deletetransaction(request):
    jsons = json.loads(request.body) # get request body
    action = jsons['action'] # get action key from jsons
    # print(action)
    
    # url: http://localhost:8000/transaction/
    # Method: POST
    # Body: raw JSON
    
    # request body:
    # {
    #     "action": "deletetransaction",
    #     "id": 1,
    # }
    
    try:
        id = jsons['id']
    except: #id baihgui bol aldaanii medeelel butsaana
        action = jsons['action']
        respdata = []
        resp = sendResponse(request, 3032, respdata, action) # response beldej baina. 6 keytei.
        return resp
    
    try: 
        myConn = connectDB() # database holbolt uusgej baina
        cursor = myConn.cursor() # cursor uusgej baina
        # Update query
        cursor = myConn.cursor() # cursor uusgej baina
        query = F"""DELETE FROM t_expenseincome 
                    WHERE id={id};""" 
        cursor.execute(query) # executing cursor1
        myConn.commit() # updating database
        cursor.close() # close the cursor. ALWAYS
        respdata = []
        resp = sendResponse(request, 1012, respdata, action) # response beldej baina. 6 keytei.
    except:
        # dt_deletetransaction service deer aldaa garval ajillana. 
        action = jsons["action"]
        respdata = [] # hooson data bustaana.
        resp = sendResponse(request, 5014, respdata, action) # standartiin daguu 6 key-tei response butsaana
        
    finally:
        disconnectDB(myConn) # yamarch uyd database holbolt uussen bol holboltiig salgana. Uchir ni finally dotor baigaa
        return resp # response bustaaj baina
#dt_deletetransaction
  


@csrf_exempt # method POST uyd ajilluulah csrf
def transactioncheckService(request): # hamgiin ehend duudagdah request shalgah service
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
        if action == "registtransaction":
            result = dt_registtransaction(request)
            return JsonResponse(result)
        if action == "getalltransaction":
            result = dt_getalltransaction(request)
            return JsonResponse(result)
        if action == "deletetransaction":
            result = dt_deletetransaction(request)
            return JsonResponse(result)
        if action == "edittransaction":
            result = dt_edittransaction(request)
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
