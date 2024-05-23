import React, {Component} from 'react';

import JSONEditor from 'jsoneditor';
import 'jsoneditor/dist/jsoneditor.css';
import './css.css'

export default class JSONEditorMy extends Component {
  componentDidMount () {
    const options = {
      mode: 'code',
      modes: ['code', 'form', 'text', 'tree', 'view', 'preview'], // allowed modes
      onChangeText: this.props.onChangeJSON,
    };

    this.jsoneditor = new JSONEditor(this.container, options);
    this.jsoneditor.set(this.props.json);
  }

  componentWillUnmount () {
    if (this.jsoneditor) {
      this.jsoneditor.destroy();
    }
  }

  componentDidUpdate() {
    this.jsoneditor.update(this.props.json);
  }

  render() {
    return (
        <div style={{
            height: '100%',
        }} className="jsoneditor-react-container" ref={elem => this.container = elem} />
    );
  }
}