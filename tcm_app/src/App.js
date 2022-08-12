import * as React from 'react';
import './App.css';
import {DataGrid} from '@mui/x-data-grid';
//import data from './DataTable.js';

class App extends React.Component
{
  constructor(props)
  {
    super(props);

    this.state = {
      ServerUpTime: "N/A",
      SystemUpTime: "N/A",
      LocalDate: "N/A",
      MemoryUsage: "N/A",
      CPU_Usage: "N/A",
      
      rowSize: 5,
      currentPage:0};
  }

  rows = [];
  docNum = 0;

  columns = [
    {field: 'id', headerName: 'ID', width: 230},
    {field: 'ServerUpTime', headerName: 'ServerUpTime', width: 130},
    {field: 'SystemUpTime', headerName: 'SystemUpTime', width: 130},
    {field: 'LocalDate', headerName: 'LocalDate', width: 200},
    {field: 'MemoryUsage', headerName: 'Memory Usage(%)', width:130},
    {field: 'CPU_Usage', headerName: 'CPU Usage(%)', width: 130}
  ];

  componentDidMount()//gets called twice?
  {
    //this.RetreiveTableData();
    this.HandlePageChange(0);
    this.RetreiveServerPing();//calls it once before the interval so state is not empty
    this.RetrieveNumOfDocs();

    //minute interval to call retreive data function
    this.requestTimer = setInterval(() => {this.RetreiveServerPing();}, 60000);
  }

  componentWillUnmount()
  {
    clearInterval(this.requestTimer);
  }

  //gets the most recent upload to mongo for display
  RetreiveServerPing = async () => {
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

  //fills the rows of the table with data from mongodb
  RetreiveTableData = async () => {
    const res = await fetch('http://localhost:3001/B');
    this.rows = await res.json();

    //changes mongos '_id' to 'id' so the table can read it
    this.rows.forEach(item => {
        let temp = item.id;
        item.id = item._id;
        item._id = temp;
    })
  }

  RetrieveNumOfDocs = async () => {
    const res = await fetch('http://localhost:3001/D');
    this.docNum = await res.json();
    console.log(this.docNum);
  }

  HandleRowSizeChange(newRowNum)
  {
    this.setState({rowSize:newRowNum});

  }

  HandlePageChange = async (newPageNum) =>
  {
    this.setState({currentPage:newPageNum});

    const res = await fetch('http://localhost:3001/C',{
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        DocNum: (this.state.rowSize),
        SkipNum: (this.state.rowSize * newPageNum)
    })
    })

    this.rows = await res.json();
    //changes mongos '_id' to 'id' so the table can read it
    this.rows.forEach(item => {
        let temp = item.id;
        item.id = item._id;
        item._id = temp;
    })

    await console.log(this.rows);
  }

  //renders the table
  DataTable()
  {
    return(
        <div style={{ height: 380, width: '90%'}}>
            <DataGrid sx={{boxShadow: 5, color: 'white'}}

            page = {this.state.currentPage}
            onPageChange = {(newPage) => this.HandlePageChange(newPage)}

            pageSize = {this.state.rowSize}
            onPageSizeChange = {(newPageSize) => this.setState({rowSize:newPageSize})}
            
            rowCount = {this.docNum}
            rowsPerPageOptions= {[5, 10, 25]}

            pagination
            paginationMode='server'

            rows = {this.rows}
            columns = {this.columns}
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