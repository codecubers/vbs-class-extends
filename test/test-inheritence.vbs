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
        dim k
        k = i + j
        WScript.Echo "K is (i + j): " & k
    End Sub

    Public Function PubFunc
        PubFunc = "I'm a func"
    End Function
End Class

Class ClassB extends ClassA

    Private m_PubProp2

    Public Property Get PubProp2
        PubProp2 = m_PubProp2
    End Property

    Public Function PubFunc2(i, j)
        k = i + j
        PubFunc2 = k
    End Function
End Class

Class ClassCA extends ClassA
    Private index
    Private Sub Class_Initialize
        index = 1
    ENd Sub
End Class

Class ClassCB extends ClassB
    Private index
    Private Sub Class_Initialize
        index = 2
    ENd Sub
End Class

Class ClassD
End Class

Public Sub OuterSUb
End SUb