	CLASS_CLASSA

	CLASS_CLASSB

	CLASS_CLASSCA

	CLASS_CLASSCB

	CLASS_CLASSD

Public Sub OuterSUb
End SUb

dim cca, fs
set cca = new ClassCA
call cca.pubSub(2, 3)
set fs = cca.GetFSO
Wscript.Echo "Calling object property -> My Path:" & fs.GetFile(Wscript.ScriptFullName).path