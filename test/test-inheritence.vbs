Extendable Class ClassA
    Public Sub PubSub(i, j)
        k = i + j
        WScript.Echo "K is (i + j): " & k
    End Sub
End Class

Extendable Class ClassB extends ClassA
    Public Function PubFunc(i, j)
        k = i + j
        PubFunc = k
    End Sub
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