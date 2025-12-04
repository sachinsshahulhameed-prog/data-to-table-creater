import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { FormField, DataRow, View, Table, User } from './types';
import FormFieldManager from './components/FormFieldManager';
import DataEntryForm from './components/DataEntryForm';
import DataTable from './components/DataTable';
import { FormIcon } from './components/icons/FormIcon';
import { TableIcon } from './components/icons/TableIcon';
import TableManager from './components/TableManager';
import Auth from './components/Auth';
import ProfileDropDown from './components/ProfileDropDown';
import { GOOGLE_API_KEY, GOOGLE_CLIENT_ID } from './config';

declare global {
    interface Window {
        gapi: any;
        google: any;
    }
}

const toColumnName = (num: number): string => {
    let columnName = '';
    let tempNum = num;
    while (tempNum > 0) {
        const remainder = (tempNum - 1) % 26;
        columnName = String.fromCharCode(65 + remainder) + columnName;
        tempNum = Math.floor((tempNum - 1) / 26);
    }
    return columnName;
};

const App: React.FC = () => {
  const [view, setView] = useState<View>(View.FORM_EDITOR);
  const [users, setUsers] = useState<Record<string, User>>({});
  const [tablesByUser, setTablesByUser] = useState<Record<string, Table[]>>({});
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTableId, setActiveTableId] = useState<number | null>(null);

  // Google Auth State
  const [isGoogleReady, setIsGoogleReady] = useState(false);
  const [isGoogleLoggedIn, setIsGoogleLoggedIn] = useState(false);
  const [googleTokenClient, setGoogleTokenClient] = useState<any>(null);


  useEffect(() => {
    // Load and initialize Google APIs
    window.gapi.load('client', initializeGapiClient);

    const checkGsi = setInterval(() => {
      if (window.google) {
        clearInterval(checkGsi);
        initializeGsiClient();
      }
    }, 100);

    return () => clearInterval(checkGsi);
  }, []);

  const initializeGapiClient = async () => {
    await window.gapi.client.init({
      apiKey: GOOGLE_API_KEY,
      discoveryDocs: ["https://sheets.googleapis.com/$discovery/rest?version=v4"],
    });
    setIsGoogleReady(true);
  };

  const initializeGsiClient = () => {
    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: 'https://www.googleapis.com/auth/spreadsheets',
      callback: (tokenResponse: any) => {
        if (tokenResponse && tokenResponse.access_token) {
          window.gapi.client.setToken({ access_token: tokenResponse.access_token });
          localStorage.setItem('google_token', tokenResponse.access_token);
          setIsGoogleLoggedIn(true);
        }
      },
    });
    setGoogleTokenClient(client);
  };

  useEffect(() => {
    if (isGoogleReady) {
        const storedToken = localStorage.getItem('google_token');
        if (storedToken) {
            window.gapi.client.setToken({ access_token: storedToken });
            setIsGoogleLoggedIn(true);
        }
    }
  }, [isGoogleReady]);

  const handleGoogleLogin = () => {
    if (googleTokenClient) {
      googleTokenClient.requestAccessToken();
    }
  };

  const handleGoogleLogout = () => {
    const token = window.gapi.client.getToken();
    if (token) {
      window.google.accounts.oauth2.revoke(token.access_token, () => {
        window.gapi.client.setToken(null);
        localStorage.removeItem('google_token');
        setIsGoogleLoggedIn(false);
      });
    }
  };


  useEffect(() => {
    try {
      const savedData = localStorage.getItem('dynamicDataCollector');
      const loggedInUsername = localStorage.getItem('currentUser');
      
      if (savedData) {
        const { users: savedUsers, tablesByUser: savedTables } = JSON.parse(savedData);
        const loadedUsers = savedUsers || {};
        setUsers(loadedUsers);
        setTablesByUser(savedTables || {});

        if (loggedInUsername && loadedUsers[loggedInUsername]) {
          setCurrentUser({ username: loggedInUsername });
          const userTables = (savedTables || {})[loggedInUsername] || [];
          if (userTables.length > 0) {
            setActiveTableId(userTables[0].id);
          }
        }
      }
    } catch (error) {
      console.error("Failed to load data from localStorage", error);
    }
  }, []);

  useEffect(() => {
    try {
      const dataToSave = JSON.stringify({ users, tablesByUser });
      localStorage.setItem('dynamicDataCollector', dataToSave);
    } catch (error) {
      console.error("Failed to save data to localStorage", error);
    }
  }, [users, tablesByUser]);

  const handleLogin = (username: string, password: string): void => {
    const user = users[username];
    if (user && user.password === password) {
      setCurrentUser({ username });
      localStorage.setItem('currentUser', username);
      const userTables = tablesByUser[username] || [];
      setActiveTableId(userTables.length > 0 ? userTables[0].id : null);
    } else {
      throw new Error('Invalid username or password.');
    }
  };

  const handleSignup = (username: string, password: string): void => {
    if (users[username]) {
      throw new Error('User with this username already exists.');
    }
    const newUser: User = { username, password };
    setUsers(prev => ({ ...prev, [username]: newUser }));

    const defaultTable: Table = {
      id: Date.now(),
      name: 'My First Table',
      fields: [{ id: Date.now(), name: 'Example Field' }],
      data: [],
    };
    setTablesByUser(prev => ({ ...prev, [username]: [defaultTable] }));

    setCurrentUser({ username });
    localStorage.setItem('currentUser', username);
    setActiveTableId(defaultTable.id);
  };

  const handleLogout = (): void => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    setActiveTableId(null);
    if(isGoogleLoggedIn) {
        handleGoogleLogout();
    }
  };

  const tables = useMemo(() => (currentUser ? tablesByUser[currentUser.username] || [] : []), [currentUser, tablesByUser]);
  const activeTable = useMemo(() => tables.find(t => t.id === activeTableId), [tables, activeTableId]);

  const setTablesForCurrentUser = (newTables: Table[] | ((prevTables: Table[]) => Table[])) => {
    if (currentUser) {
      setTablesByUser(prev => ({
        ...prev,
        [currentUser.username]: typeof newTables === 'function' ? newTables(prev[currentUser.username] || []) : newTables
      }));
    }
  };
  
  const addTable = useCallback(() => {
    const newTable: Table = {
      id: Date.now(),
      name: `New Table ${tables.length + 1}`,
      fields: [],
      data: [],
    };
    setTablesForCurrentUser(prev => [...prev, newTable]);
    setActiveTableId(newTable.id);
    setView(View.FORM_EDITOR);
  }, [tables.length]);

  const removeTable = useCallback((id: number) => {
    if (tables.length <= 1) {
        alert("Cannot delete the last table.");
        return;
    }
    setTablesForCurrentUser(prev => {
        const newTables = prev.filter(t => t.id !== id);
        if (activeTableId === id) {
            setActiveTableId(newTables[0]?.id || null);
        }
        return newTables;
    });
  }, [tables.length, activeTableId]);

  const renameTable = useCallback((id: number, newName: string) => {
    if (!newName.trim()) {
        alert("Table name cannot be empty.");
        return;
    }
    if (tables.some(t => t.name.toLowerCase() === newName.toLowerCase() && t.id !== id)) {
        alert("A table with this name already exists.");
        return;
    }
    setTablesForCurrentUser(prev => prev.map(t => t.id === id ? {...t, name: newName} : t));
  }, [tables]);

  const updateTable = useCallback((tableId: number, updates: Partial<Table>) => {
      setTablesForCurrentUser(prevTables =>
          prevTables.map(table =>
              table.id === tableId ? { ...table, ...updates } : table
          )
      );
  }, []);

  const addField = useCallback((name: string) => {
    if (!activeTable) return;
    if (name && !activeTable.fields.some(f => f.name.toLowerCase() === name.toLowerCase())) {
        const newFields = [...activeTable.fields, { id: Date.now(), name }];
        updateTable(activeTable.id, { fields: newFields });
    } else {
      alert('Field name cannot be empty or a duplicate.');
    }
  }, [activeTable, updateTable]);

  const removeField = useCallback((fieldId: number) => {
    if (!activeTable) return;
    const fieldToRemove = activeTable.fields.find(f => f.id === fieldId);
    if (!fieldToRemove) return;
    const newFields = activeTable.fields.filter(field => field.id !== fieldId);
    const newData = activeTable.data.map(row => {
      const newRow = { ...row };
      delete newRow[fieldToRemove.name];
      return newRow;
    });
    updateTable(activeTable.id, { fields: newFields, data: newData });
  }, [activeTable, updateTable]);

  const addData = useCallback((newRow: DataRow) => {
    if (!activeTable) return;
    const newData = [...activeTable.data, newRow];
    updateTable(activeTable.id, { data: newData });
  }, [activeTable, updateTable]);

  const handleSyncToGoogleSheet = async () => {
    if (!activeTable || !window.gapi.client.sheets) {
        alert("Google Sheets API not ready.");
        return;
    }
    
    try {
        let spreadsheetId = activeTable.spreadsheetId;

        // 1. Create spreadsheet if it doesn't exist
        if (!spreadsheetId) {
            const createResponse = await window.gapi.client.sheets.spreadsheets.create({
                properties: { title: activeTable.name }
            });
            spreadsheetId = createResponse.result.spreadsheetId;
            const sheetUrl = createResponse.result.spreadsheetUrl;
            updateTable(activeTable.id, { spreadsheetId, sheetUrl });
        }

        const headers = activeTable.fields.map(f => f.name);
        
        // 2. Clear the existing sheet content
        await window.gapi.client.sheets.spreadsheets.values.clear({
            spreadsheetId: spreadsheetId,
            range: 'Sheet1', 
        });

        // 3. Update sheet with new data if there are any fields defined
        if (headers.length > 0) {
            const dataRows = activeTable.data.map(row => 
                activeTable.fields.map(field => row[field.name] ?? '')
            );

            const values = [headers, ...dataRows];
            const lastColumn = toColumnName(headers.length);
            const range = `Sheet1!A1:${lastColumn}${values.length}`;

            await window.gapi.client.sheets.spreadsheets.values.update({
                spreadsheetId: spreadsheetId,
                range: range,
                valueInputOption: 'USER_ENTERED',
                resource: { values }
            });
        }
        
        alert('Successfully synced to Google Sheet!');

    } catch (err: any) {
        console.error("Error syncing to Google Sheet", err);
        
        let descriptiveError = 'An unknown error occurred. Please check the console for details.';

        if (err) {
            if (typeof err.result?.error?.message === 'string') {
                descriptiveError = err.result.error.message;
            } else if (typeof err.message === 'string') {
                descriptiveError = err.message;
            } else {
                try {
                    const errorString = JSON.stringify(err);
                    if (errorString !== '{}') {
                        descriptiveError = errorString;
                    }
                } catch (stringifyError) {
                    // Ignore circular reference errors
                }
            }
        }
        
        alert(`Failed to sync to Google Sheet. Error: ${descriptiveError}`);

        if (err?.status === 401 || err?.result?.error?.status === 'UNAUTHENTICATED') {
            handleGoogleLogout();
            alert("Your Google session has expired. Please connect again.");
        }
    }
  };


  if (!currentUser) {
    return <Auth onLogin={handleLogin} onSignup={handleSignup} />;
  }

  const Header: React.FC = () => (
    <header className="bg-white dark:bg-gray-800 shadow-md rounded-lg">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white truncate" title={activeTable?.name}>
            {activeTable ? activeTable.name : 'Data Collector'}
          </h1>
          <div className="flex items-center gap-4">
            <nav className="flex items-center space-x-2 p-1 bg-gray-200 dark:bg-gray-700 rounded-lg">
              <button
                onClick={() => setView(View.FORM_EDITOR)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  view === View.FORM_EDITOR
                    ? 'bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 shadow'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                }`}
              >
                <FormIcon />
                <span className="hidden sm:inline">Form & Data Entry</span>
                <span className="sm:hidden">Form</span>
              </button>
              <button
                onClick={() => setView(View.DATA_VIEW)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  view === View.DATA_VIEW
                    ? 'bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 shadow'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                }`}
              >
                <TableIcon />
                <span className="hidden sm:inline">View Data</span>
                 <span className="sm:hidden">Data</span>
              </button>
            </nav>
            <ProfileDropDown 
              username={currentUser.username} 
              onLogout={handleLogout} 
              isGoogleLoggedIn={isGoogleLoggedIn}
              onGoogleLogin={handleGoogleLogin}
              onGoogleLogout={handleGoogleLogout}
            />
          </div>
        </div>
      </div>
    </header>
  );

  if (!activeTable) {
    return (
       <div className="h-screen text-gray-900 dark:text-gray-100 grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6 p-4 sm:p-6">
          <TableManager 
              tables={tables}
              activeTableId={activeTableId}
              onSelectTable={setActiveTableId}
              onAddTable={addTable}
              onRenameTable={renameTable}
              onRemoveTable={removeTable}
          />
          <div className="flex flex-col gap-6 overflow-hidden">
             <Header />
             <main className="flex-grow flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">No Table Selected</h2>
                    <p className="text-gray-600 dark:text-gray-400">Please create or select a table to begin.</p>
                    <button 
                      onClick={addTable}
                      className="mt-4 text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center flex items-center gap-2 transition dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-blue-800"
                    >
                      Create First Table
                    </button>
                </div>
            </main>
          </div>
      </div>
    );
  }

  return (
    <div className="h-screen text-gray-900 dark:text-gray-100 grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6 p-4 sm:p-6">
      <TableManager 
          tables={tables}
          activeTableId={activeTableId}
          onSelectTable={setActiveTableId}
          onAddTable={addTable}
          onRenameTable={renameTable}
          onRemoveTable={removeTable}
      />
      <div className="flex flex-col gap-6 overflow-hidden">
        <Header />
        <main className="flex-grow overflow-y-auto pr-2">
            {view === View.FORM_EDITOR ? (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              <div className="lg:col-span-2">
                <FormFieldManager fields={activeTable.fields} addField={addField} removeField={removeField} />
              </div>
              <div className="lg:col-span-3">
                <DataEntryForm fields={activeTable.fields} onAddData={addData} />
              </div>
            </div>
          ) : (
            <DataTable 
                fields={activeTable.fields} 
                data={activeTable.data} 
                tableName={activeTable.name}
                isGoogleLoggedIn={isGoogleLoggedIn}
                onSyncToSheet={handleSyncToGoogleSheet}
                sheetUrl={activeTable.sheetUrl}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default App;