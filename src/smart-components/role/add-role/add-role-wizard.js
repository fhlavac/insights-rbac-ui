import React, { useState } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Wizard } from '@patternfly/react-core';
import { addNotification } from '@redhat-cloud-services/frontend-components-notifications/';
import { createRole, fetchRoles } from '../../../redux/actions/role-actions';
import SummaryContent from './summary-content';
import ResourceDefinitions from './resource-definitions';
import RoleInformation from './role-information';
import PermissionInformation from './permission-information';
import { WarningModal } from '../../common/warningModal';
import { useIntl } from 'react-intl';
import messages from '../../../Messages';
import '../../common/hideWizard.scss';

const AddRoleWizard = () => {
  const intl = useIntl();
  const [formData, setFormData] = useState({});
  const [isRoleFormValid, setIsRoleFormValid] = useState(false);
  const [isPermissionFormValid, setIsPermissionFormValid] = useState(false);
  const [stepIdReached, setStepIdReached] = useState(1);
  const { push } = useHistory();

  const { pagination } = useSelector(
    ({ roleReducer: { roles, filterValue, isLoading } }) => ({
      roles: roles.data,
      pagination: roles.meta,
      isLoading,
      searchFilter: filterValue,
    }),
    shallowEqual
  );

  const dispatch = useDispatch();

  const handleChange = (data) => {
    setFormData({ ...formData, ...data });
  };

  const handleRoleChange = (data, isValid) => {
    handleChange(data);
    setIsRoleFormValid(isValid);
  };

  const handlePermissionChange = (data, isValid) => {
    handleChange(data);
    setIsPermissionFormValid(isValid);
  };

  const steps = [
    {
      id: 1,
      name: intl.formatMessage(messages.nameAndDescription),
      canJumpTo: stepIdReached >= 1,
      component: new RoleInformation(formData, handleRoleChange),
      enableNext: isRoleFormValid,
    },
    {
      id: 2,
      name: intl.formatMessage(messages.permission),
      canJumpTo: stepIdReached >= 2 && isRoleFormValid,
      component: new PermissionInformation(formData, handlePermissionChange),
      enableNext: isPermissionFormValid,
    },
    {
      id: 3,
      name: intl.formatMessage(messages.resourceDefinitions),
      canJumpTo: stepIdReached >= 3 && isRoleFormValid && isPermissionFormValid,
      component: new ResourceDefinitions(formData, handleChange),
    },
    {
      id: 4,
      name: intl.formatMessage(messages.review),
      canJumpTo: stepIdReached >= 4 && isRoleFormValid && isPermissionFormValid,
      component: new SummaryContent(formData),
      nextButtonText: intl.formatMessage(messages.confirm),
    },
  ];

  const onNext = ({ id }) => {
    const step = stepIdReached < id ? id : stepIdReached;
    setStepIdReached(step);
  };

  const onSubmit = async () => {
    const roleData = {
      applications: [formData.application],
      description: formData.description,
      name: formData.name,
      access: [
        {
          // Permission must be in the format "application:resource_type:operation"
          permission: `${formData.application}:${formData.resourceType}:${formData.permission}`,
          resourceDefinitions: formData.resourceDefinitions.map((definition) => {
            return {
              attributeFilter: {
                key: definition.key,
                operation: definition.operation,
                value: definition.value,
              },
            };
          }),
        },
      ],
    };
    const role = await dispatch(createRole(roleData));
    dispatch(fetchRoles(pagination).then(push('/roles')));
    return role;
  };

  const onCancel = () => {
    dispatch(
      addNotification({
        variant: 'warning',
        title: intl.formatMessage(messages.creatingRoleCanceled),
        dismissDelay: 8000,
      })
    );
    push('/roles');
  };

  const [cancelWarningVisible, setCancelWarningVisible] = useState(false);

  return (
    <React.Fragment>
      <Wizard
        className={cancelWarningVisible && 'rbac-m-wizard__hidden'}
        title={intl.formatMessage(messages.addRole)}
        isOpen
        onClose={() => {
          (!Object.values(formData).filter(Boolean).length > 0 && onCancel()) || setCancelWarningVisible(true);
        }}
        onNext={onNext}
        onSave={onSubmit}
        steps={steps}
      />
      <WarningModal type="role" isOpen={cancelWarningVisible} onModalCancel={() => setCancelWarningVisible(false)} onConfirmCancel={onCancel} />
    </React.Fragment>
  );
};

AddRoleWizard.defaultProps = {
  users: [],
  inputValue: '',
  selectedGroup: undefined,
  selectedUsers: [],
  selectedRoles: [],
};

AddRoleWizard.propTypes = {
  addNotification: PropTypes.func.isRequired,
  createRole: PropTypes.func.isRequired,
  fetchRoles: PropTypes.func.isRequired,
  inputValue: PropTypes.string,
  pagination: PropTypes.shape({
    limit: PropTypes.number.isRequired,
    offset: PropTypes.number.isRequired,
    count: PropTypes.number.isRequired,
  }),
};

export default AddRoleWizard;
