import React from 'react';
import { act } from 'react-dom/test-utils';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import MuaBundleRoute from '../../../smart-components/myUserAccess/MUABundleRoute';

jest.mock('../../../smart-components/myUserAccess/bundles/rhel');

const ComponentWrapper = ({ children, initialEntries }) => <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>;
describe('<MUABundleRoute />', () => {
  it('should render placeholder component when no bundle is found', () => {
    /**
     * This action will log an error to console, that is expected
     */
    const { container } = render(
      <ComponentWrapper initialEntries={['/foo?bundle=nonsense']}>
        <MuaBundleRoute />
      </ComponentWrapper>
    );

    expect(container).toMatchSnapshot();
  });

  it('should render rhel bundle mock', async () => {
    let container;
    await act(async () => {
      const { container: ci } = render(
        <ComponentWrapper initialEntries={['/foo?bundle=rhel']}>
          <MuaBundleRoute />
        </ComponentWrapper>
      );
      container = ci;
    });

    expect(container.querySelector('div#rhel-mock')).toBeInTheDocument();
  });
});
