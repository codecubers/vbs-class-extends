'   Class extraction started.Extendable Class ClassB
    Public Function PubFunc(i, j)
        k = i + j
        PubFunc = k
    End Sub


	

Private m_ClassA

Private Sub Class_Initialize
		set m_ClassA = new ClassA
	End Sub




	Public Sub PubSub(i, j) : PubSub = m_ClassA.PubSub(i, j) : End Sub
End Class

Class ClassCA
    Private index



	

Private m_ClassA

Private Sub Class_Initialize
		set m_ClassA = new ClassA
		
        index = 1
    
	ENd Sub




	


	Public Sub PubSub(i, j) : PubSub = m_ClassA.PubSub(i, j) : End Sub
End Class

Class ClassCB
    Private index



	

Private m_ClassB

Private Sub Class_Initialize
		set m_ClassB = new ClassB
		
        index = 2
    
	ENd Sub




	
End Class

