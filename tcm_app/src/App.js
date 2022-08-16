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
      
      rows: [],
      rowSize: 5,
      currentPage:0};
  }

  
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
    this.HandlePageChange(0);
    this.RetrieveNumOfDocs();

    this.RetreiveServerPing();//calls it once before the interval so state is not empty
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

    this.setState({ServerUpTime:json.ServerUpTime});
    this.setState({SystemUpTime:json.SystemUpTime});
    this.setState({LocalDate:json.LocalDate});
    this.setState({MemoryUsage:json.MemoryUsage});
    this.setState({CPU_Usage:json.CPU_Usage});

    //this.state.ServerUpTime = json.ServerUpTime;
    //this.state.SystemUpTime = json.SystemUpTime;
    //this.state.LocalDate = json.LocalDate;
    //this.state.MemoryUsage = json.MemoryUsage;
    //this.state.CPU_Usage = json.CPU_Usage;
    //this.setState({state: this.state});
    //return json;
  }

  //fills the rows of the table with data from mongodb
  RetreiveTableData = async () => {
    const res = await fetch('http://localhost:3001/B');
    const tempRows = await res.json();

    //changes mongos '_id' to 'id' so the table can read it
    tempRows.forEach(item => {
        let temp = item.id;
        item.id = item._id;
        item._id = temp;
    })

    this.setState({rows:tempRows});
  }

  RetrieveNumOfDocs = async () => {
    const res = await fetch('http://localhost:3001/D');
    this.docNum = await res.json();
    //console.log(this.docNum);
  }

  HandleRowSizeChange = async (newRowNum) =>
  {
    this.setState({rowSize:newRowNum});
    this.setState({currentPage:0});

    const res = await fetch('http://localhost:3001/C',{
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        DocNum: (newRowNum),
        SkipNum: (0)
    })
    })

    const tempRows = await res.json();

    //changes mongos '_id' to 'id' so the table can read it
    tempRows.forEach(item => {
        let temp = item.id;
        item.id = item._id;
        item._id = temp;
    })

    //this.setState({rows:tempRows});
    this.setState((state) => {
      return{rows:tempRows}
    });
    console.log(this.state.rows);
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

    const tempRows = await res.json();

    //changes mongos '_id' to 'id' so the table can read it
    tempRows.forEach(item => {
        let temp = item.id;
        item.id = item._id;
        item._id = temp;
    })

    console.log(tempRows[0]);
    //this.setState({rows:tempRows});
    this.setState((state) => {
      return{rows:tempRows}
    });
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
            onPageSizeChange = {(newPageSize) => this.HandleRowSizeChange(newPageSize)}
            
            rowCount = {this.docNum}
            rowsPerPageOptions= {[5, 10, 25]}

            pagination
            paginationMode='server'

            rows = {this.state.rows}
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