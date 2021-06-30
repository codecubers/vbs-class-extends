' Build: test-inheritence.vbs

	Class ClassA

    Private m_PubProp

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
        k = i + j
        WScript.Echo "K is (i + j): " & k
    End Sub

    Public Function PubFunc
        PubFunc = "I'm a func"
    End Function
End Class



	Class ClassB

    Private m_PubProp

    Private m_ClassA

    Private Sub Class_Initialize
        set m_ClassA = new ClassA
    End Sub

    Public Default Sub PubSub(i, j)
        call m_ClassA.PubSub(i, j)
    End Sub

    Public Function PubFunc
        PubFunc = m_ClassA.PubFunc
    End Function

    Public Property Get PubProp()
        PubProp.Get = m_ClassA.PubProp()
    End Property

    Public Property Set PubProp(Value)
        PubProp.Set = m_ClassA.PubProp(Value)
    End Property

    Public Property Let PubPropLet(Value)
        PubPropLet.Let = m_ClassA.PubPropLet(Value)
    End Property

    Public Default Property Get PubProp
        PubProp = m_PubProp
    End Property

    Public Function PubFunc(i, j)
        k = i + j
        PubFunc = k
    End Function
End Class



	Class ClassCA
    Private index

    Private m_ClassA

    Private Sub Class_Initialize
        set m_ClassA = new ClassA

        index = 1

    ENd Sub

    Public Default Sub PubSub(i, j)
        call m_ClassA.PubSub(i, j)
    End Sub

    Public Function PubFunc
        PubFunc = m_ClassA.PubFunc
    End Function

    Public Property Get PubProp()
        PubProp.Get = m_ClassA.PubProp()
    End Property

    Public Property Set PubProp(Value)
        PubProp.Set = m_ClassA.PubProp(Value)
    End Property

    Public Property Let PubPropLet(Value)
        PubPropLet.Let = m_ClassA.PubPropLet(Value)
    End Property

End Class



	Class ClassCB
    Private index

    Private m_ClassB

    Private Sub Class_Initialize
        set m_ClassB = new ClassB

        index = 2

    ENd Sub

    Public Function PubFunc(i, j)
        PubFunc = m_ClassB.PubFunc(i, j)
    End Function

    Public Default Property Get PubProp
        PubProp.Get = m_ClassB.PubProp
    End Property

End Class



	Class ClassD
End Class



Public Sub OuterSUb
End SUb