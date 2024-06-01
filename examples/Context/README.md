# Context

context 提供一個共享的資訊，包含純值與函數，你可以再任何 Effect 底下任意取用，而實際 Context 的值或是函數的內容是什麼，通常是在真正要執行整個 Effect program 情況下會被要求帶入。