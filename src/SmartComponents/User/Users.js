import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import propTypes from 'prop-types';
import { Route, Link } from 'react-router-dom';
import { Toolbar, ToolbarGroup, ToolbarItem, Button } from '@patternfly/react-core';
//import ExpandableList from '../../SmartComponents/ContentList/ExpandableList';
import ContentList from '../../SmartComponents/ContentList/ContentList';
import UserList from './UserList';
import UsersFilterToolbar from '../../PresentationalComponents/User/UsersFilterToolbar';
import { fetchUsers } from '../../redux/Actions/UserActions';
import { fetchGroups } from '../../redux/Actions/GroupActions';
import AddUser from './add-user-modal';
import RemoveUser from './remove-user-modal';
import './user.scss';
import { scrollToTop } from '../../Helpers/Shared/helpers';
import { fetchGroupsByUserId } from '../../redux/Actions/UserActions';

class Users extends Component {
    state = {
      filteredItems: [],
      isOpen: false,
      filterValue: ''
    };

    fetchData = () => {
      this.props.fetchUsers();
      this.props.fetchGroups();
    };

    componentDidMount() {
      this.fetchData();
      scrollToTop();
    }

  onFilterChange = filterValue => this.setState({ filterValue })

  renderToolbar() {
    return (
      <Toolbar className="searchToolbar">
        <UsersFilterToolbar onFilterChange={ this.onFilterChange } filterValue={ this.state.filterValue } />
        <ToolbarGroup>
          <ToolbarItem>
            <Link to="/users/add-user">
              <Button
                variant="primary"
                aria-label="Create Approver"
              >
                Create Approver
              </Button>
            </Link>
          </ToolbarItem>
        </ToolbarGroup>
      </Toolbar>
    );
  }

  render() {
    let filteredItems = {
      items: this.props.users
      .filter(({ email }) => email.toLowerCase().includes(this.state.filterValue.trim().toLowerCase())),
      isLoading: this.props.isLoading && this.props.users.length === 0
    };

    return (
      <Fragment>
        <Route exact path="/users/add-user" component={ AddUser } />
        <Route exact path="/users/edit/:id" component={ AddUser } />
        <Route exact path="/users/remove/:id" component={ RemoveUser } />
        { this.renderToolbar() }
        <UserList { ...filteredItems } noItems={ 'No Approvers' } fetchGroupsByUserId = { this.props.fetchGroupsByUserId }/>
      </Fragment>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    users: state.userReducer.users,
    isLoading: state.userReducer.isUserDataLoading,
    groups: state.groupReducer.groups,
    searchFilter: state.userReducer.filterValue
  };
};

const mapDispatchToProps = dispatch => {
  return {
    fetchUsers: apiProps => dispatch(fetchUsers(apiProps)),
    fetchGroupsByUserId: apiProps => dispatch(fetchGroupsByUserId(apiProps)),
    fetchGroups: apiProps => dispatch(fetchGroups(apiProps))
  };
};

Users.propTypes = {
  filteredItems: propTypes.array,
  users: propTypes.array,
  isLoading: propTypes.bool,
  searchFilter: propTypes.string,
  fetchUsers: propTypes.func.isRequired,
  fetchGroups: propTypes.func.isRequired,
  fetchGroupsByUserId: propTypes.func.isRequired
};

Users.defaultProps = {
  users: []
};

export default connect(mapStateToProps, mapDispatchToProps)(Users);