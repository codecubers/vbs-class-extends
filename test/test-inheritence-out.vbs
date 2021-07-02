	Class ClassA

    Private m_PubProp
    Private fso

    Private Sub Class_Initialize
        set fso = CreateObject("scripting.FileSystemObject")
    End Sub

    Public Property Get GetFSO
        set GetFSO = fso
    End Property

    Public Property Get PubProp()
        PubProp = m_PubProp
    End Property

    Public Property Set PubProp(Value)
        Set m_PubProp = Value
    End Property

    Public Property Let PubPropLet(Value)
        m_PubProp = Value
    End Property

    Public Default Sub PubSub(i, j)
        dim k
        k = i + j
        WScript.Echo "Class CA called Class A's PubSub(i + j): " & k
    End Sub

    Public Function PubFunc
        PubFunc = "I'm a func"
    End Function
End Class



	Class ClassB

    Private m_PubProp2

    Public Property Get PubProp2
        PubProp2 = m_PubProp2
    End Property

    Public Function PubFunc2(i, j)
        k = i + j
        PubFunc2 = k
    End Function
End Class



	Class ClassCA
    Private index

    Private m_CLASSA

    Private Sub Class_Initialize
        set m_CLASSA = new CLASSA

        index = 1

    ENd Sub

    Public Default Sub PubSub(i, j)
        call m_CLASSA.PubSub(i, j)
    End Sub

    Public Function PubFunc
        PubFunc = m_CLASSA.PubFunc
    End Function

    Public Property Get GetFSO
        set GetFSO = m_CLASSA.GetFSO
    End Property

    Public Property Get PubProp()
        PubProp = m_CLASSA.PubProp()
    End Property

    Public Property Set PubProp(Value)
        set m_CLASSA.PubProp = Value
    End Property

    Public Property Let PubPropLet(Value)
        m_CLASSA.PubPropLet = Value
    End Property

End Class



	Class ClassCB
    Private index
    Private Sub Class_Initialize
        index = 2
    ENd Sub
End Class



	Class ClassD
End Class



Public Sub OuterSUb
End SUb

dim cca, fs
set cca = new ClassCA
call cca.pubSub(2, 3)
set fs = cca.GetFSO
Wscript.Echo "Calling object property -> My Path:" & fs.GetFile(Wscript.ScriptFullName).path