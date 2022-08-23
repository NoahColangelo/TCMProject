import * as React from 'react';
import './App.css';
import {DataGrid} from '@mui/x-data-grid';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

class App extends React.Component
{
  constructor(props)
  {
    super(props);

    this.state = {
      //for the server ping
      ServerUpTime: "N/A",
      SystemUpTime: "N/A",
      LocalDate: "N/A",
      MemoryUsage: "N/A",
      CPU_Usage: "N/A",
      
      //for the data table
      rows: [],
      rowSize: 5,
      currentPage: 0,

      //for the graphs
      memGraphData: [],
      CPUGraphData: [],
      timeDateGraphData: [],

      //graph options
      memUsageOptions: 0,
      CPU_UsageOptions: 0
    };
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
    this.RetreiveGraphData();

    //calls it once before the interval so state is not empty
    this.RetreiveServerPing();

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
  }

  //gets the data needed to fill the graphs
  RetreiveGraphData = async () => {
    const res = await fetch('http://localhost:3001/B');
    const tempData = await res.json();

    let tempMem = [];
    let tempCPU = [];
    let tempDate = [];

    for(let i = 0; i < tempData.length; i++)
    {
      tempMem.push(parseInt(tempData[i].MemoryUsage));
      tempCPU.push(tempData[i].CPU_Usage);
      tempDate.push(tempData[i].LocalDate);
    }

    this.setState({memGraphData:tempMem});
    this.setState({CPUGraphData:tempCPU});
    this.setState({timeDateGraphData: tempDate});

    this.SetGraphOptions();
  }

  RetrieveNumOfDocs = async () => {
    const res = await fetch('http://localhost:3001/D');
    this.docNum = await res.json();
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

    this.setState((state) => {
      return{rows:tempRows}
    });
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

    this.setState((state) => {
      return{rows:tempRows}
    });
  }

  SetGraphOptions()
  {
    this.setState({memUsageOptions:{
      chart: {
        width: 1000
      },
      plotOptions:{
      series: {turboThreshold: 1000 },
      line: {turboThreshold: 1000}
      },
      series: [
      {
        name: 'Memory Usage',
        data: this.state.memGraphData
      }],
      title: {
        text: 'Memory Usage vs LocalDate/Time'
      },
      xAxis: {
        title: { text: 'LocalDate/Time'},
        categories: this.state.timeDateGraphData,
        tickInterval: 50
      },
      yAxis: {
        title:{ text:'Memory Usage (%)'},
      }
    }});

    this.setState({CPU_UsageOptions: {
      chart: {
        width: 1000
      },
      plotOptions:{
        series: {turboThreshold: 1000 },
        line: {turboThreshold: 1000}
      },
      series: [
      {
        name: 'CPU_Usage',
        data: this.state.CPUGraphData
      }],
      title: {
        text: 'CPU_Usage vs LocalDate/Time'
      },
      xAxis: {
        title: { text: 'LocalDate/Time'},
        categories: this.state.timeDateGraphData,
        tickInterval: 50
      },
      yAxis: {
        title:{ text:'CPU Usage (%)'},
        max: 100
      }
    }});
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

        <HighchartsReact highcharts = {Highcharts} options={this.state.memUsageOptions} />
        <p> </p>
        <HighchartsReact highcharts = {Highcharts} options={this.state.CPU_UsageOptions} />
        <p> </p>

      </header>
    </div>
    );
  }
}

export default App;