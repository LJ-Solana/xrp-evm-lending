import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Home from './pages/index';
import Lending from './pages/LendingApp';

function App() {

  return (
    <Router>
      
          <Switch>
            <Route path="/" exact component={Home} />
            <Route path="/lending" exact component={Lending} />
          </Switch>
   
    </Router>
  );
}

export default App;
