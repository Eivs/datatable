import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Nav } from 'rsuite';
import CodeView from 'react-code-view';

const CustomCodeView = ({ ...props }) => (
  <Col md={10}>
    <CodeView {...props} />
  </Col>
);

class Examples extends React.Component {
  static propTypes = {
    dependencies: PropTypes.object,
    list: PropTypes.array,
  };

  constructor(props) {
    super(props);
    this.state = {
      index: 0,
    };
  }

  render() {
    const { list, dependencies } = this.props;
    const { index } = this.state;
    return (
      <div>
        <Row>
          <Col md={2}>
            <Nav>
              {list.map((item, i) => (
                <Nav.Item
                  key={`${item.title}-nav`}
                  onClick={() => {
                    this.setState({ index: i });
                  }}
                >
                  {item.title}
                </Nav.Item>
              ))}
            </Nav>
          </Col>
          <CustomCodeView
            key={`${list[index].title}-code`}
            dependencies={dependencies}
          >
            {list[index].content}
          </CustomCodeView>
        </Row>
      </div>
    );
  }
}

export default Examples;
