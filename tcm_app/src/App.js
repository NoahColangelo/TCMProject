import React from 'react';
import './App.css';
import {DataGrid} from '@mui/x-data-grid';

class App extends React.Component
{
  constructor(props)
  {
    super(props);

    this.state = {ServerUpTime: "N/A",
      SystemUpTime: "N/A",
      LocalDate: "N/A",
      MemoryUsage: "N/A",
      CPU_Usage: "N/A"};
  }

  componentDidMount()//gets called twice?
  {
    this.RetreiveB();
    this.RetreiveData();//calls it once before the interval so state is not empty

    //minute interval to call retreive data function
    this.requestTimer = setInterval(() => {this.RetreiveData();}, 60000);
  }

  componentWillUnmount()
  {
    clearInterval(this.requestTimer);
  }

  //gets the most recent upload to mongo for display
  RetreiveData = async () => {
    const res = await fetch('http://localhost:3001/A');
    const json = await res.json();

    this.state.ServerUpTime = json.ServerUpTime;
    this.state.SystemUpTime = json.SystemUpTime;
    this.state.LocalDate = json.LocalDate;
    this.state.MemoryUsage = json.MemoryUsage;
    this.state.CPU_Usage = json.CPU_Usage;

    this.setState({state: this.state});
    return json;
  }

  rows = [];

  //fills the rows of the table with data from mongodb
  RetreiveB = async () => {
    const res = await fetch('http://localhost:3001/B');
    this.rows = await res.json();

    //changes mongos '_id' to 'id' so the table can read it
    this.rows.forEach(item => {
        let temp = item.id;
        item.id = item._id;
        item._id = temp;
    })
  }

  columns = [
    {field: 'id', headerName: 'ID', width: 230},
    {field: 'ServerUpTime', headerName: 'ServerUpTime', width: 130},
    {field: 'SystemUpTime', headerName: 'SystemUpTime', width: 130},
    {field: 'LocalDate', headerName: 'LocalDate', width: 200},
    {field: 'MemoryUsage', headerName: 'Memory Usage(%)', width:130},
    {field: 'CPU_Usage', headerName: 'CPU Usage(%)', width: 130}
  ];

  //renders the table
  DataTable()
  {
    return(
        <div style={{ height: 380, width: '90%'}}>
            <DataGrid sx={{boxShadow: 5, color: 'white'}}
            rows = {this.rows}
            columns = {this.columns}
            pageSize = {5}
            rowsPerPageOptions= {[5]}
            />
        </div>
    );
  }

  render()
  {
    return (
      <div className="App">
        <header className="App-header">
        <p>Super Cool Website Display</p>
        {this.DataTable()}
        <p>
          Most Recent Server Ping:
        </p>
        <p> ServerUpTime: {this.state.ServerUpTime}, SystemUpTime: {this.state.SystemUpTime}</p>
        <p> Local Date/Time: {this.state.LocalDate} </p>
        <p> Memory Usage: {this.state.MemoryUsage}%, CPU Usage: {this.state.CPU_Usage}%</p>
      </header>
    </div>
    );
  }
}

export default App;