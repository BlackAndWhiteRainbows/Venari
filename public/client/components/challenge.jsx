import React from 'react';
import ReactDOM from 'react-dom';
import ImageUploadForm from './ImageUploadForm.jsx';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import RaisedButton from 'material-ui/RaisedButton';
import {
  Table,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn,
} from 'material-ui/Table';
import axios from 'axios';


export default class Challenge extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      items: [],
      itemIndex: '',
      challengeData: [],
      challengeId: props.match.params.id.slice(1),
      user: '',
    };
  }

  componentWillMount() {
    // axios.get('/login/facebook/getUser').then((res) => {
    //   console.log(res, "this is FB res")
    //   this.setState({ user: res, userLoaded: true})
    // }).catch((err) => {
    //   console.log(err);
    // });

    axios.get('/challenges').then((res) => {
      res.data.forEach((challenge) => {
        if (challenge.id.toString() === this.state.challengeId) {
          this.setState({ challengeData: challenge });
        }
      });

      axios.get(`/challenge:${this.state.challengeId}`).then((res) => {
        this.setState({ items: res.data, loaded: true });
      });
    });
  }

  render() {
    if (!this.state.loaded) return <div>Loading New Challenges</div>;
    return (
      <div>
        <MuiThemeProvider>
          <Table
            // onCellClick={(index) => { this.setState({ itemIndex: index }); }}
          >
            <TableHeader
              displaySelectAll={false}
              adjustForCheckbox={false}
              enableSelectAll={false}
            >
              <TableRow>
                <TableHeaderColumn>{this.state.challengeData.title}</TableHeaderColumn>
              </TableRow>
            </TableHeader>
            <TableBody
              displayRowCheckbox={false}
              showRowHover
            >
              {this.state.items.map((item, index) => (
                <TableRow key={item.id}>
                  <TableRowColumn>
                    <ImageUploadForm index={index} challenge={this.state.challengeData.title} username="bob" item={item.name} />
                  </TableRowColumn>
                </TableRow>
                ))}
            </TableBody>
          </Table>
        </MuiThemeProvider>
      </div>
    );
  }

}
