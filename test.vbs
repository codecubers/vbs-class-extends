'comment over head	
	' comment with tab
	   ' comment with spaces
Class abc   'comments inline
	 Public default Sub say
	 	WScript.Echo "Hi.''''''''"''''.' ."  ' "'"'"'" comment & string contains double quotes
	 	WScript.Echo "1'"
	 	WScript.Echo "2"'"
	 	WScript.Echo "3'"
	 	WScript.Echo "4'"
	 	WScript.Echo "5'"
	 	WScript.Echo "6'"
	 	WScript.Echo "7"'"
	 	Wscript.Echo "8'"
	 	Wscript.Echo "9"'"
	 	Wscript.Echo "10'"
	 	Wscript.Echo "11"'"
	 	Wscript.Echo "12'"
	 	Wscript.Echo "13''"'
	 	Wscript.Echo "14'"'
	 	Wscript.Echo "15''"
	 	Wscript.Echo "16'''"
	 	Wscript.Echo "17'"'"''"
	 	Wscript.Echo "18'"'"''"
	 End Sub
		
	
	Public Sub DeleteFile(file)
		On Error Resume Next
		objFSO.DeleteFile(file)
		On Error GoTo 0
	End Sub
	
End Class

Dim a
Set a = New abc
a.say

'''''one more comment
WScript.echo "''''" & "8798797 b' 987987987" & _
"'jhjkhk'" '980989i