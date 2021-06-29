


' ================================== Job: vbspm-build ================================== 

' ================= src : lib/core/init.vbs ================= 
Option Explicit

Dim debug: debug = (WScript.Arguments.Named("debug") = "true")
if (debug) Then WScript.Echo "Debug is enabled"
Dim VBSPM_TEST_INDEX: VBSPM_TEST_INDEX = 1
Dim vbspmDir: vbspmDir=Left(WScript.ScriptFullName,InStrRev(WScript.ScriptFullName,"\"))
Dim baseDir
With CreateObject("WScript.Shell")
    baseDir=.CurrentDirectory
End With
' Judging by the declaration and description of the startsWith Java function, 
' the "most straight forward way" to implement it in VBA would either be with Left:
' Author: Blackhawk
' Source: https://stackoverflow.com/a/20805609/1751166

Public Function startsWith(str, prefix)
    startsWith = Left(str, Len(prefix)) = prefix
End Function

Public Function endsWith(str, suffix)
    endsWith = Right(str, Len(suffix)) = suffix
End Function

Public Function contains(str, char)
    contains = (Instr(1, str, char) > 0)
End Function

Public Function argsArray()
    Dim i
    ReDim arr(WScript.Arguments.Count-1)
    For i = 0 To WScript.Arguments.Count-1
        arr(i) = """"+WScript.Arguments(i)+""""
    Next
    argsArray = arr
End Function

Public Function argsDict()
    Dim i, param, dict
    set dict = CreateObject("Scripting.Dictionary")
    dict.CompareMode = vbTextCompare
    ReDim arr(WScript.Arguments.Count-1)
    For i = 1 To WScript.Arguments.Count-1
        param = WScript.Arguments(i)
        If startsWith(param, "/") And contains(param, ":") Then
            param = mid(param, 2)
            WScript.Echo "param to be split: " & param
            dict.Add Lcase(split(param, ":")(0)), split(param, ":")(1)
        Else
            dict.Add i, param
        End If
    Next
    set argsDict = dict
End Function

' ================= src : lib/core/Console/Console.vbs ================= 
Class Console
	
	' Author: Uwe Keim
	' License: The Code Project Open License (CPOL)
	' https://www.codeproject.com/Articles/250/printf-like-Format-Function-in-VBScript
	''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''
	' works like the printf-function in C.
	' takes a string with format characters and an array
	' to expand.
	'
	' the format characters are always "%x", independ of the
	' type.
	'
	' usage example:
	'	dim str
	'	str = fmt( "hello, Mr. %x, today's date is %x.", Array("Miller",Date) )
	'	response.Write str
	Public Function fmt( str, args )
		Dim res		' the result string.
		res = ""
		
		Dim pos		' the current position in the args array.
		pos = 0
		
		Dim i
		For i = 1 To Len(str)
			' found a fmt char.
			If Mid(str,i,1)="%" Then
				If i<Len(str) Then
					' normal percent.
					If Mid(str,i+1,1)="%" Then
						res = res & "%"
						i = i + 1
						
						' expand from array.
					ElseIf Mid(str,i+1,1)="x" Then
						res = res & CStr(args(pos))
						pos = pos+1
						i = i + 1
					End If
				End If
				
				' found a normal char.
			Else
				res = res & Mid(str,i,1)
			End If
		Next
		
		fmt = res
	End Function
	
End Class
' ================= src : lib/core/init-functions.vbs ================= 
Dim oConsole                         
set oConsole = new Console
PUblic Sub printf(str, args)
    'TODO: If use use %s, %d, %f format the values according to it.
    str = Replace(str, "%s", "%x")
    str = Replace(str, "%i", "%x")
    str = Replace(str, "%f", "%x")
    str = Replace(str, "%d", "%x")
    WScript.Echo oConsole.fmt(str, args)
End Sub

Public Sub debugf(str, args)
    if (debug) Then printf str, args
End Sub

Public Sub EchoX(str, args)
    If Not IsNull(args) Then
        If IsArray(args) Then
            'WScript.Echo str & " with args " & join(args, ",")
            WScript.Echo oConsole.fmt(str, args)
        Else
            'WScript.Echo str & " with arg " & args
            WScript.Echo oConsole.fmt(str, Array(args))
        End if
    Else
        WScript.Echo str
    End If
End Sub

Public Sub Echo(str) 
    EchoX str, NULL
End Sub

Public Sub EchoDX(str, args)
    if (debug) Then EchoX str, args
End Sub

Public Sub EchoD(str) 
    EchoDX str, NULL
End Sub
' ================= src : lib/core/Collection/Collection.vbs ================= 


Class Collection

    Private dict
    Private oThis
    Private m_Name

    Private Sub Class_Initialize()
        set dict = CreateObject("Scripting.Dictionary")
        set oThis = Me
        m_Name = "Undefined"
    End Sub

    Public Default Property Get Obj
        set Obj = dict
    End Property 
    Public Property Set Obj(d)
        set dict = d
    End Property 

    Public Property Get Name
        Name = m_Name
    End Property
    Public Property Let Name(Value)
        m_Name = Value
    End Property

    Public Sub Add(Key, Value)
        dict.Add key, value
    End Sub ' Add

    Public Sub Remove(Key)
        If KeyExists(Key) Then
            dict.Remove(Key)
        Else
            RaiseErr "Key [" & Key & "] does not exists in collection."
        End If
    End Sub ' Remove

    Public Sub RemoveAll()
        dict.RemoveAll()
    End Sub

    Public Property Get Count
        Count = dict.Count
    End Property

    Public Function GetItem(Key)
        If KeyExists(Key) Then
            GetItem = dict.Item(Key)
        Else
            'TODO: Should we raise an error?
            RaiseErr "Key [" & Key & "] does not exists in collection."
        End If
    End Function ' GetItem

    Public Function GetItemAtIndex(Index)
        'TODO: How to ensure Index is an integer?
        GetItemAtIndex = dict.Item(Index)
    End Function ' GetItemAtIndex


    Public Function IndexOf(Key)
        IndexOf = dict.IndexOf(Key, 0)
    End Function

    Public Function KeyExists(Key)
        KeyExists = dict.Exists(Key)
    End Function

    Public Function toCSV
        toCSV = join(toArray(), ", ")
    End Function

    Public Function toArray
        toArray = dict.Items
    End Function

    Public Function isEmpty
        isEmpty = (dict.Count = 0)        
    End Function ' isEmpty
    
    ' Public Sub ReverseKeys

    '     Dim i, j, last, half, temp, arr
    '     arr = dict.Keys
    '     WScript.Echo join(arr, ", ")
    '     last = UBound(arr)
    '     half = Int(last/2)

    '     For i = 0 To half
    '         temp = arr(i)
    '         arr(i) = arr(last-i)
    '         arr(last-i) = temp
    '     Next
        
    '     WScript.Echo join(arr, ", ")

    '     dim dict1
    '     set dict1 = New Collection
    '     for i = 0 to UBound(arr)
    '         dict1.Add arr(i), arr(i) & "1"
    '     next
    '     'WScript.Echo dict1.toCSV
    '     ' RemoveAll
    '     set dict = dict1

    ' End Sub

    ' list.Sort (available in DictUtil)
    ' list.Reverse
        ' for each k in dict.Keys
        '     if k = Key Then
        '         KeyExists = true
        '         Exit Function
        '     End If
        ' next


    Private Sub RaiseErr(desc)
        Err.Clear
        Err.Raise 1000, "Collection Class Error", desc
    End Sub

    Private Sub Class_Terminate()
        set dict = Nothing
        set oThis = Nothing
    End Sub

End Class ' Collection
' ================= src : lib/core/DictUtil.vbs ================= 
Class DictUtil
    
    ' Author: Dale Fugier <https://developer.rhino3d.com/authors/dale_fugier>
    ' Source: https://developer.rhino3d.com/guides/rhinoscript/vbscript-dictionaries/
    ' Description:
    '   Sorts a dictionary by either key or item
    ' Parameters:
    '   objDict - the dictionary to sort
    '   intSort - the field to sort (1=key, 2=item)
    ' Returns:
    '   A dictionary sorted by intSort
    ''' <summary>Sorts a dictionary by either key or item</summary>
	''' <param name="objDict">The dictionary to sort</param>
	''' <param name="intSort">The field to sort (1=key, 2=item)</param>
    Function SortDictionary(objDict, intSort)

        ' declare constants
        Const dictKey  = 1
        Const dictItem = 2

        ' declare our variables
        Dim strDict()
        Dim objKey
        Dim strKey,strItem
        Dim X,Y,Z

        ' get the dictionary count
        Z = objDict.Count

        ' we need more than one item to warrant sorting
        If Z > 1 Then
            ' create an array to store dictionary information
            ReDim strDict(Z,2)
            X = 0
            ' populate the string array
            For Each objKey In objDict
                strDict(X,dictKey)  = CStr(objKey)
                strDict(X,dictItem) = CStr(objDict(objKey))
                X = X + 1
            Next

            ' perform a a shell sort of the string array
            For X = 0 To (Z - 2)
            For Y = X To (Z - 1)
                If StrComp(strDict(X,intSort),strDict(Y,intSort),vbTextCompare) > 0 Then
                    strKey  = strDict(X,dictKey)
                    strItem = strDict(X,dictItem)
                    strDict(X,dictKey)  = strDict(Y,dictKey)
                    strDict(X,dictItem) = strDict(Y,dictItem)
                    strDict(Y,dictKey)  = strKey
                    strDict(Y,dictItem) = strItem
                End If
            Next
            Next

            ' erase the contents of the dictionary object
            objDict.RemoveAll

            ' repopulate the dictionary with the sorted information
            For X = 0 To (Z - 1)
            objDict.Add strDict(X,dictKey), strDict(X,dictItem)
            Next

        End If
    End Function
End Class
' ================= src : lib/core/ArrayUtil/ArrayUtil.vbs ================= 
Class ArrayUtil
	
	Public Function toString(arr)
		If Not isArray(arr) Then
			toString = "Supplied parameter is not an array."
			Exit Function
		End If
		
		Dim s, i
		s = "Array{" & UBound(arr) & "} [" & vbCrLf
		For i = 0  To UBound(arr)
			s = s & vbTab & "[" & i & "] => [" & arr(i) & "]"
			If i < UBound(arr) Then s = s & ", "
			s = s &  vbCrLf
		Next
		s = s & "]"
		toString = s
		
	End Function
	
	Public Function contains(arr, s) 
		If Not isArray(arr) Then
			toString = "Supplied parameter is not an array."
			Exit Function
		End If
		
		Dim i, bFlag
		bFlag = False
		For i = 0  To UBound(arr)
			If arr(i) = s Then
				bFlag = True
				Exit For
			End If
		Next
		contains = bFlag
	End Function
	
	'TODO: Add functionality to manage Array (redim, get last, add new etc.,)
	'TODO: With ability to sort, reverse, avoid duplicates etc.,
End Class
' ================= inline ================= 

Dim arrUtil
set arrUtil = new ArrayUtil

' ================= src : lib/core/PathUtil/PathUtil.vbs ================= 
Class PathUtil
	
	Private Property Get DOT
	DOT = "."
	End Property
	Private Property Get DOTDOT
	DOTDOT = ".."
	End Property
	
	Private oFSO
	Private m_base
	Private m_script
	Private m_temp
	
	Private Sub Class_Initialize()
		Set oFSO = CreateObject("Scripting.FileSystemObject")
		m_script = Left(WScript.ScriptFullName,InStrRev(WScript.ScriptFullName,"\")-1)
		m_base = m_script
		m_temp = Array()
		ReDim Preserve m_temp(0)
		m_temp(0) = m_script
	End Sub
	
	Public Property Get ScriptPath
	ScriptPath = m_script
	End Property
	
	Public Property Get BasePath
	BasePath = m_base
	End Property
	
	Public Property Let BasePath(path)
	Do While endsWith(path, "\")
		path = Left(Path, Len(path)-1)
	Loop
	m_base = Resolve(path)
	EchoDX "New Base Path: %x", m_base
	End Property
	
	Public Property Get TempBasePath
	TempBasePath = m_temp(UBound(m_temp))
	End Property
	
	Public Property Let TempBasePath(path)
	Do While endsWith(path, "\")
		path = Left(Path, Len(path)-1)
	Loop
	If arrUtil.contains(m_temp, path) Then
		EchoDX "Temp Path %x already exists; skipped", path
	Else
		ReDim Preserve m_temp(Ubound(m_temp)+1)
		m_temp(Ubound(m_temp)) = Resolve(path)
		EchoDX "New Temp Base Path: %x", m_temp(Ubound(m_temp))
	End If
	End Property
	
	Function Resolve(path)
		Dim pathBase, lPath, final
		EchoDX "path: %x", path
		If path = DOT Or path = DOTDOT Then
			path = path & "\"
		End If
		EchoDX "path: %x", path
		
		If oFSO.FolderExists(path) Then
			EchoD "FolderExists"
			Resolve = oFSO.GetFolder(path).path
			Exit Function
		End If
		
		If oFSO.FileExists(path) Then
			EchoD "FileExists"
			Resolve = oFSO.GetFile(path).path
			Exit Function
		End If
		
		pathBase = oFSO.BuildPath(m_base, path)
		EchoDX "Adding base %x to path %x. New Path: %x", Array(m_base, path, pathBase)
		
		If endsWith(pathBase, "\") Then
			If isObject(oFSO.GetFolder(pathBase)) Then
				EchoD "EndsWith '\' -> FolderExists"
				Resolve = oFSO.GetFolder(pathBase).Path
				Exit Function
			End If
		Else
			
			If oFSO.FolderExists(pathBase) Then
				EchoD "FolderExists"
				Resolve = oFSO.GetFolder(pathBase).path
				Exit Function
			End If
			
			If oFSO.FileExists(pathBase) Then
				EchoD "FileExists"
				Resolve = oFSO.GetFile(pathBase).path
				Exit Function
			End If
			
			Dim i
			i = Ubound(m_temp)
			Do
				lPath = oFSO.BuildPath(m_temp(i), path)
				EchoDX "Adding Temp Base path (%x) %x to path %x. New Path: %x", Array(i, m_temp(i), path, lPath)
				If oFSO.FileExists(lPath) Then
					final = oFSO.GetFile(lPath).path
					EchoDX "File Resolved with Temp Base %x", final
					Resolve = final
					Exit Function
				End If
				If oFSO.FolderExists(lPath) Then
					final = oFSO.GetFolder(lPath)
					EchoDX "Folder Resolved with Temp Base %x", final
					Resolve = final
					Exit Function
				End If
				i = i - 1
			Loop While i >= 0
			
			lPath = oFSO.BuildPath(m_script, path)
			EchoDX "Adding script path %x to path %x. New Path: %x", Array(m_script, path, lPath)
			If oFSO.FileExists(lPath) Then
				final = oFSO.GetFile(lPath).path
				EchoDX "File Resolved with Temp Base %x", final
				Resolve = final
				Exit Function
			End If
			If oFSO.FolderExists(lPath) Then
				final = oFSO.GetFolder(lPath)
				EchoDX "Folder Resolved with Temp Base %x", final
				Resolve = final
				Exit Function
			End If
		End If
		
		EchoD "Unable to Resolve"
		Resolve = path
	End Function ' Resolve
	
	Private Sub Class_Terminate()
		Set oFSO = Nothing
	End Sub
	
End Class ' PathUtil
' ================= inline ================= 

Dim putil
set putil = new PathUtil
putil.BasePath = baseDir
EchoX "Project location: %x", putil.BasePath

' ================= src : lib/core/FSO/FSO.vbs ================= 
' ==============================================================================================
' Implementation of several use cases of FileSystemObject into this class
' Author: Praveen Nandagiri (pravynandas@gmail.com)
' ==============================================================================================

Class FSO
	Private dir
	Private objFSO
	
	Private Sub Class_Initialize
		Set objFSO = CreateObject("Scripting.FileSystemObject")
		dir = Left(WScript.ScriptFullName,InStrRev(WScript.ScriptFullName,"\"))
	End Sub
	
	' Update the current directory of the instance if needed
	Public Sub setDir(s)
		dir = s
	End Sub
	
	Public Function getDir
		getDir = dir
	End Function
	
	Public Function GetFSO
		Set GetFSO = objFSO
	End Function
	
	Public Function FolderExists(fol)
		FolderExists = objFSO.FolderExists(fol)
	End Function
	
	' ===================== Sub Routines =====================
	
	Public Function CreateFolder(fol)
		CreateFolder = False
		If FolderExists(fol) Then
			CreateFolder = True
		Else
			objFSO.CreateFolder(fol)
			CreateFolder = FolderExists(fol)
		End If
	End Function
	
	Public Sub WriteFile(strFileName, strMessage, overwrite)
		Const ForReading = 1
		Const ForWriting = 2
		Const ForAppending = 8
		Dim mode
		Dim oFile
		
		mode = ForWriting
		If Not overwrite Then
			mode = ForAppending
		End If
		
		If objFSO.FileExists(strFileName) Then
			Set oFile = objFSO.OpenTextFile(strFileName, mode)
		Else
			Set oFile = objFSO.CreateTextFile(strFileName)
		End If
		oFile.WriteLine strMessage
		
		oFile.Close
		
		Set oFile = Nothing
	End Sub 
	
	' ===================== Function Routines =====================
	
	Public Function GetFileDir(ByVal file)
		EchoDX "GetFileDir( %x )", Array(file)
		Dim objFile
		Set objFile = objFSO.GetFile(file)
		GetFileDir = objFSO.GetParentFolderName(objFile) 
	End Function
	
	Public Function GetFilePath(ByVal file)
		EchoDX "GetFilePath( %x )", Array(file)
		Dim objFile
		On Error Resume Next
		Set objFile = objFSO.GetFile(file)
		On Error GoTo 0
		If IsObject(objFile) Then
			GetFilePath = objFile.Path 
		Else
			EchoDX "File %x not found; searching in directory %x", Array(file,dir)
			On Error Resume Next
			Set objFile = objFile.GetFile(objFSO.BuildPath(dir, file))
			On Error GoTo 0
			If IsObject(objFile) Then
				GetFilePath = objFile.Path 
			Else
				GetFilePath = "File [" & file & "] Not found"
			End If
		End If
	End Function
	
	''' <summary>Returns a specified number of characters from a string.</summary>
	''' <param name="file">File Name</param>
	Public Function GetFileName(ByVal file)
		GetFileName = objFSO.GetFile(file).Name
	End Function
	
	Public Function GetFileExtn(file)
		GetFileExtn = ""
		On Error Resume Next
		GetFileExtn = LCASE(objFSO.GetExtensionName(file))
		On Error GoTo 0
	End Function
	
	Public Function GetBaseName(ByVal file)
		GetBaseName = Replace(GetFileName(file), "." & GetFileExtn(file), "")
	End Function
	
	Public Function ReadFile(file)
		file = putil.Resolve(file)
		EchoDX "---> File resolved to: %x", Array(file)
		If Not FileExists(file) Then 
			Wscript.Echo "---> File " & file & " does not exists."
			ReadFile = ""
			Exit Function
		End If
		Dim objFile: Set objFile = objFSO.OpenTextFile(file)
		ReadFile = objFile.ReadAll()
		objFile.Close
	End Function
	
	Public Function FileExists(file)
		FileExists = objFSO.FileExists(file)
	End Function
	
	Public Sub DeleteFile(file)
		On Error Resume Next
		objFSO.DeleteFile(file)
		On Error GoTo 0
	End Sub
	
End Class
' ================= inline ================= 

Dim cFS
set cFS = new FSO

cFS.setDir(baseDir)

Public Function log(msg)
cFS.WriteFile "build.log", msg, false
End Function

'vbspmDir = cFS.GetFileDir(WScript.ScriptFullName)
log "VBSPM Directory: " & vbspmDir


' ================= src : lib/core/include-build.vbs ================= 

Public Sub Include(file)
  ' DO NOT REMOVE THIS Sub Routine
End Sub
Public Sub Import(file)
  ' DO NOT REMOVE THIS Sub Routine
End Sub


'================= File: C:\Users\nanda\git\xps.local.npm\vbs-excel-unpack\Excel.vbs =================
Class Excel

    Private Property Get vbext_ct_Document
    vbext_ct_Document = 100
    End Property
    Private Property Get vbext_ct_ClassModule
    vbext_ct_ClassModule = 2
    End Property
    Private Property Get vbext_ct_MSForm
    vbext_ct_MSForm = 3
    End Property
    Private Property Get vbext_ct_StdModule
    vbext_ct_StdModule = 1
    End Property
    Private Property Get vbext_ct_ActiveXDesigner
    vbext_ct_ActiveXDesigner = 11
    End Property
    Private Property Get excel_workbook_protected_level_protected
    excel_workbook_protected_level_protected = 1
    End Property
    Private Property Get ForReading
    ForReading = 1
    End Property
    Private Property Get ForWriting
    ForWriting = 2
    End Property
    Private Property Get ForAppending
    ForAppending = 3
    End Property
    Private Property Get TristateUseDefault
    TristateUseDefault = 2
    End Property
    Private Property Get TristateTrue
    TristateTrue = 1
    End Property
    Private Property Get TristateFalse
    TristateFalse = 0
    End Property

    Public Property Get GetActiveWorkbook
        Set GetActiveWorkbook = ActiveWorkbook
    End Property

    Private Application
    Private ActiveWorkbook
    Private wkbSource
    Private objFSO

    Private Sub Class_Initialize()
        Set objFSO = CreateObject("scripting.filesystemobject")
        set Application = createobject("Excel.Application").Application
        if Application is nothing then
            Echo "Unable to create Excel Application object."
            Err.Clear
            Err.Raise 50001, "Error in Excel Class", "Unable to create Excel application object."
            Class_Terminate
        end if
        SetVisibility False
        ShowAlerts False
    End Sub

    Public Sub OpenWorkBook(path)
        On Error Resume Next
        path = putil.Resolve(path)
        EchoDX "Opening Excel Workbook at path: %x", path
        set ActiveWorkbook = Application.workbooks.Open(path)
        On Error Goto 0
        if Not IsObject(ActiveWorkbook) then
            EchoX "Unable to Open Excel Workbook at path %x.", path
            Err.Clear
            Err.Raise 50002, "Error in Excel Class", "Unable to open Excel Workbook at path " & path
        end if
        ''' NOTE: This workbook must be open in Excel.
        Set wkbSource = Application.Workbooks(ActiveWorkbook.Name)
        EchoX "Workbook %x opened successfully.", wkbSource.Name
    End Sub
    Public SUb CloseWorkBook
        On Error Resume Next
        ActiveWorkbook.Close
        On Error Goto 0
    End Sub

    Public Function isProtected
        On Error Resume Next
        isProtected = False
        isProtected = (wkbSource.VBProject.Protection = excel_workbook_protected_level_protected)
        On Error Goto 0
    End Function

    Public Sub SetVisibility(flag)
        Application.Visible = (flag or LCase(flag) = "true")
    End Sub
    Public Sub ShowAlerts(flag)
        Application.DisplayAlerts = (flag Or Lcase(flag) = "true")
    End Sub

    Public Sub ExportVBAComponents(destination)
        Dim cmpComponent, bExport, szFileName

        If isProtected Then
            Echo "The workbook is protected. Cannot export VB Components."
            Exit Sub
        End If


        If IsNull(destination) Or destination = "" Then
            EchoX "Destination directory not provided. Will be uploaded to default direcotry %x", GetActiveWorkbook.Name
            destination = putil.Resolve(GetActiveWorkbook.Name)
        End If

        destination = objFSO.GetBaseName(destination)
        destination = objFSO.BuildPath(putil.BasePath, destination)
        If cFS.CreateFolder(destination) Then
            EchoX "Destination Directory successfully created at: %x", destination
        Else
            EchoX "Unable to create destination directory at [%x]. Please create it and retry.", destination
            Exit Sub
        End If

        If Not objFSO.FolderExists(destination) Then
            EchoX "Destination folder %x does not exists. Please create it and retry.", destination
            Exit Sub
        End If
        destination = ObjFSO.GetFolder(destination)

        'TODO: Move objFSO code to it's own class
        On Error Resume Next
        EchoX "Deleting previously exported VBA Modules in direcotry %x", destination
        objFSO.DeleteFile objFSO.BuildPath(destination, "*.cls"), True
        objFSO.DeleteFile  objFSO.BuildPath(destination, "*.frm"), True
        objFSO.DeleteFile  objFSO.BuildPath(destination, "*.bas"), True
        objFSO.DeleteFile  objFSO.BuildPath(destination, "*.frx"), True
        On Error GoTo 0
        
        EchoX "Exporting VBComponents to folder: %x", destination
        For Each cmpComponent In wkbSource.VBProject.VBComponents
            
            bExport = True
            szFileName = cmpComponent.Name

            ''' Concatenate the correct filename for export.
            Select Case cmpComponent.Type
                Case vbext_ct_ClassModule
                    szFileName = szFileName & ".cls"
                Case vbext_ct_MSForm
                    szFileName = szFileName & ".frm"
                Case vbext_ct_StdModule
                    szFileName = szFileName & ".bas"
                Case vbext_ct_Document
                    ''' This is a worksheet or workbook object.
                    ''' Don't try to export.
                    bExport = False
            End Select
            
            If bExport Then
                ''' Export the component to a text file.
                'EchoX "Exporting Module %x to %x", Array(szFileName, objFSO.BuildPath(destination, szFileName))
                'On Error Resume Next
                cmpComponent.Export objFSO.BuildPath(destination, szFileName)
                'Echo Err.Description
                'On Error Goto 0
                
            ''' remove it from the project if you want
            '''wkbSource.VBProject.VBComponents.Remove cmpComponent
            
            End If
        Next 
        Echo "Unpacking completed succesfully."
    End Sub

    Public Sub ImportVBAComponents(source)
        Dim cmpComponents, objFile
        
        If IsNull(source) Or source = "" Then
            source = objFSO.GetBaseName(GetActiveWorkbook.Name)
            source = objFSO.BuildPath(putil.BasePath, source)
            EchoX "Source directory not provided. Assuming default direcotry %x", source
        End If

        If Not objFSO.FolderExists(source) Then
            EchoX "Unable to get source directory at: %x. Did you try exporting the scripts first?", source
            Exit Sub
        End If

        If isProtected Then
            Echo "The workbook is protected. Cannot export VB Components."
            Exit Sub
        End If

        Set cmpComponents = wkbSource.VBProject.VBComponents

        ''' Import all the code modules in the specified path
        ''' to the wkbSource.
        DeleteVBAComponents False

        For Each objFile In objFSO.GetFolder(source).Files
            If (objFSO.GetExtensionName(objFile.Name) = "cls") Or _
                (objFSO.GetExtensionName(objFile.Name) = "frm") Or _
                (objFSO.GetExtensionName(objFile.Name) = "bas") Then
                cmpComponents.Import objFile.Path
            End If
        Next 

        wkbSource.save
        Echo "Packing completed succesfully."
    End Sub

    Public Sub DeleteVBAComponents(save)
        Dim VBComponents, VBComp 

        If isProtected Then
            Echo "The workbook is protected. Cannot delete VB Components."
            Exit Sub
        End If

        Echo "About to delete the VBA components of the workbook"
        Set VBComponents = wkbSource.VBProject.VBComponents
        For Each VBComp In VBComponents
            If VBComp.Type = vbext_ct_Document Then
                'Thisworkbook or worksheet module
                'We do nothing
            Else
                VBComponents.Remove VBComp
            End If
        Next 
        if(save) Then wkbSource.save
    End Sub

    Public Sub SimpleXYPlot(data, destination)
    
        If IsNull(destination) Or destination = "" Then
            EchoX "Destination directory not provided. Will be uploaded to default direcotry %x", GetActiveWorkbook.Name
            destination = putil.Resolve(GetActiveWorkbook.Name)
        End If

        destination = objFSO.GetBaseName(destination)
        destination = objFSO.BuildPath(putil.BasePath, destination)
        If cFS.CreateFolder(destination) Then
            EchoX "Destination Directory successfully created at: %x", destination
        Else
            EchoX "Unable to create destination directory at [%x]. Please create it and retry.", destination
            Exit Sub
        End If
        destination = objFSO.BuildPath(destination, "SimpleXYPlot.png")

        dim arr
        arr = split(data, ",")
        with Application.ActiveWorkbook.worksheets(1)
            .usedrange.clear
            .Range("A2").value = arr(0)
            .Range("B2").value = arr(1)
            .Range("A2").value = arr(2)
            .Range("B2").value = arr(3)
            .Range("A3").value = arr(4)
            .Range("B3").value = arr(5)
            .Range("A4").value = arr(6)
            .Range("B4").value = arr(7)
        end with
        Application.Run "'" & ActiveWorkbook.Name & "'!PlotTheChart", "SimpleXY", destination, "Dark"  
    End Sub

    Public Sub RunModuleMacro(macro) 
        Application.Run "'" & ActiveWorkbook.Name & "'!" & macro 
    End Sub

    Public Sub RunSheetMacro(sheet, macro)
        Application.Run "'" & ActiveWorkbook.Name & "'!'" & sheet & "'." & macro
    End Sub

    Private Sub Class_Terminate()
        EchoD "Excel Class being terminated."
        On Error Resume Next
        ShowAlerts
        ActiveWorkbook.close
        set ActiveWorkbook = nothing
        Application.quit
        set Application = nothing
        On Error Goto 0
    End Sub

End Class ' Excel


'================= File: C:\Users\nanda\git\xps.local.npm\vbs-excel-unpack\lib\parameters.vbs =================
' Dim dutil, d, col, wbFile
' set dutil = new DictUtil
' set d = argsDict

'Sort by keys (named arguments or index)
' call dutil.SortDictionary(d, 1)
' EchoX "Parameter Keys: %x", join(d.Keys, "|| ")
' EchoX "Parameter Items: %x", join(d.Items, "|| ")

' set col = new Collection
' set col.Obj = d
Dim wbFile, sourceDir, destDir, data
If Wscript.Arguments.Named.Exists("workbook") Then
    wbFile = Wscript.Arguments.Named("workbook")
    EchoX "Excel workbook to be packed/unpacked: %x", wbFile
Else
    Echo "No excel workbook supplied as a parameter. Nothing to unpack."
    WScript.Quit
End If

If Wscript.Arguments.Named.Exists("source") Then
    sourceDir = Wscript.Arguments.Named("source")
    EchoX "Excel workbook will be packed from directory: %x", sourceDir
End If

If Wscript.Arguments.Named.Exists("destination") Then
    destDir = Wscript.Arguments.Named("destination")
    EchoX "Excel workbook will be unpacked to directory: %x", destDir
End If

If Wscript.Arguments.Named.Exists("data") Then
    data = Wscript.Arguments.Named("data")
    EchoX "Data received: %x", data
End If




'================= File: C:\Users\nanda\git\xps.local.npm\vbs-excel-unpack\lib\export.vbs =================
Include(".\parameters.vbs")
Include("..\Excel.vbs")
Dim xl
set xl = new Excel
EchoX "Opening workbook at path: %x", wbFile
xl.OpenWorkBook(wbFile)
EchoX "Active workbook name is: %x", xl.GetActiveWorkbook.Name
xl.ExportVBAComponents(destDir)
xl.CloseWorkBook
set xl = nothing
