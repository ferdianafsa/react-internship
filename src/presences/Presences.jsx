import React, { Component } from "react";
import axios from "axios";
import ReactDOM from "react-dom";
import Pagination from "react-js-pagination";
import PropTypes from "prop-types";
import { CSVLink, CSVDownload } from "react-csv";
import ReactToExcel from 'react-html-table-to-excel';
import { Link } from "react-router-dom";
import $ from "jquery";
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import AwesomeComponent from '../dashboard/AwesomeComponent';
import Button from '@material-ui/core/Button';
import jsPDF from 'jspdf';
import 'jspdf-autotable'
import Moment from 'react-moment';
import AppBar from '../dashboard/AppBar';

// require("bootstrap/less/bootstrap.less");

const useStyles = makeStyles({
  table: {
    minWidth: 650,
  },
});

function createData(name, calories, fat, carbs, protein) {
  return { name, calories, fat, carbs, protein };
}

const rows = [
  createData('Frozen yoghurt', 159, 6.0, 24, 4.0),
  createData('Ice cream sandwich', 237, 9.0, 37, 4.3),
  createData('Eclair', 262, 16.0, 24, 6.0),
  createData('Cupcake', 305, 3.7, 67, 4.3),
  createData('Gingerbread', 356, 16.0, 49, 3.9),
];

export default class Products extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      activePage: 1,
      totalPage: 0,
      loading: false,
      presences: []
    };
  }

  componentDidMount() {
    this.getPresences();
  }

  getPresences = () => {
    this.setState({ loading : true });
    let token = localStorage.getItem('token');
    axios.get(`https://internship2.herokuapp.com/api/v1/presences?page=${this.state.activePage}`, { headers: {
                                                                                              'accept': 'application/json',
                                                                                              "Authorization" : `${token}`} })
      .then(response => {
        console.log(response);
        this.setState({presences: response.data.presences});
        this.setState({totalPage: response.data.meta.totalPage });
      });

    setTimeout(() => {
        this.setState({loading : false});
      }, 2000)
  }

  handlePageChange = (pageNumber) => {
    console.log(`active page is ${pageNumber}`);
    this.setState({activePage: pageNumber});
    this.getPresences();
  }

  jsPdfGenerator = () => {
    const doc = new jsPDF()
    doc.autoTable({ html: '#table-presences' })
    doc.save('table.pdf')
  }

  exportCsv = () => {
    var csvRow= [];
    var A = [['no', 'checkin', 'checkout']];
    var re = this.state.presences;
    console.log(re);

    for(var item=0; item<re.length;item++) {
      A.push([item,re[item].checkin,re[item].checkout]);
    }

    for(var i=0; i<A.length;++i) {
      csvRow.push(A[i].join(","))
    }
    console.log(csvRow);

    var csvString = csvRow.join("%0A");

    var a = document.createElement("a");
    a.href='data:attachment/csv,'+csvString;
    a.target ="_Blank";
    a.download="reports.csv";
    document.body.appendChild(a);

    a.click();
  }
  render() {
    const { loading } = this.state;
    return (
      <div>
        <AppBar />
        <center> { loading && <span><AwesomeComponent /></span> } </center>
        <Button color="primary" onClick={this.exportCsv}>
          csv
        </Button>
        <Button color="primary"onClick={this.jsPdfGenerator}>
          pdf
        </Button>
        <ReactToExcel
          variant="contained"
          color="primary"
          className="btn"
          table="table-presences"
          filename="excel file"
          sheet="sheet 1"
          buttonText="xls"
         />
        { !loading &&

        <TableContainer component={Paper}>
          <Table className="" size="small" id="table-presences" aria-label="a dense table">
            <TableHead>
              <TableRow>
                <TableCell align="right">Checkin</TableCell>
                <TableCell align="right">Checkout</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {this.state.presences.map(presence => (
                <TableRow key={presence.id}>
                  <TableCell align="right"><Moment>{presence.checkin}</Moment></TableCell>
                  <TableCell align="right"><Moment>{presence.checkout}</Moment></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      }
        <br />
        <Pagination
          activePage={this.state.activePage}
          itemsCountPerPage={10}
          totalItemsCount={this.state.totalPage * 10}
          pageRangeDisplayed={5}
          onChange={this.handlePageChange.bind(this)}
          itemClass="page-item"
          linkClass="page-link"
        />
      </div>
    );
  }
}