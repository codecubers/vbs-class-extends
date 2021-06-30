

Option Explicit

Dim debug: debug = (WScript.Arguments.Named("debug") = "true")
if (debug) Then WScript.Echo "Debug is enabled"
Dim VBSPM_TEST_INDEX: VBSPM_TEST_INDEX = 1
Dim vbspmDir: vbspmDir=Left(WScript.ScriptFullName,InStrRev(WScript.ScriptFullName,"\"))
Dim baseDir
With CreateObject("WScript.Shell")
    baseDir=.CurrentDirectory
End With

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
End Function	CLASS_Console

Dim oConsole                         
set oConsole = new Console
PUblic Sub printf(str, args)

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

            WScript.Echo oConsole.fmt(str, args)
        Else

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
End Sub	CLASS_Collection

	CLASS_DictUtil

	CLASS_ArrayUtil

Dim arrUtil
set arrUtil = new ArrayUtil	CLASS_PathUtil

Dim putil
set putil = new PathUtil
putil.BasePath = baseDir
EchoX "Project location: %x", putil.BasePath	CLASS_FSO

Dim cFS
set cFS = new FSO

cFS.setDir(baseDir)

Public Function log(msg)
cFS.WriteFile "build.log", msg, false
End Function

log "VBSPM Directory: " & vbspmDir

Public Sub Include(file)

End Sub
Public Sub Import(file)

End Sub	CLASS_Excel

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
