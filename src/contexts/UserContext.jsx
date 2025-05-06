import {createContext, useContext, useState} from "react";
const UserContext = createContext();

export const UserProvider = ({children}) => {     
    const [user, setUser] = useState(null);  
    
    const login = (userInfo) => {        
        setUser(userInfo);    
    };        
    const logout = () => {        
        setUser(null);    
    };        
    
    return (      
        <UserContext.Provider value={{user, setUser, login, logout}}>            
            {children}      
        </UserContext.Provider>      
    );
};

export const useUser = () => useContext(UserContext);