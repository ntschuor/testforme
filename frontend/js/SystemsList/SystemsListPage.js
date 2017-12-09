import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Menu } from 'semantic-ui-react';
import { browserHistory } from 'react-router';

import SystemsTable from './components/SystemsTable';

import { getSystemsList } from './actions/SystemsActions';

class SystemsListPage extends React.Component {
  componentWillMount() {
    this.props.getSystemsList();
  }
  handleForwardToSystemsGroup() {
    console.log('forwardTo(/systemsgroup)');
    browserHistory.push('/systemsgroup');
  }
	render() {
		return (
      <div>
        <Menu>
          <Menu.Item
            name='Systems'
          >
          Systems
          </Menu.Item>
         <Menu.Item
           name='Systems Groups'
           onClick={this.handleForwardToSystemsGroup}
         >
           Systems Group
         </Menu.Item>
       </Menu>
  			<SystemsTable systems={this.props.data.systemsList.systemsList} isLoading={this.props.data.currentlyLoading}/>
      </div>
		)
	}
}

function mapStateToProps(state) {
  return {
    data: state.systemsList
  };
}

function mapDispatchToProps(dispatch) {
  return {
    getSystemsList: () => {
      dispatch(getSystemsList());
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(SystemsListPage)
