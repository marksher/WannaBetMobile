pragma solidity ^0.4.24;

library LibraryDemo{
    function add(
    	uint a, 
    	uint b
    ) 
    	public 
    	pure 
    	returns(
    		uint c
    	)
    {
        return a + b;
    }
}
