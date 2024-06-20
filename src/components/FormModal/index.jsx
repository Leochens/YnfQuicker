import React, { ReactElement, useState } from 'react';
import { Button, Modal, Checkbox, Form, Input, ModalProps, message, Select } from 'antd';
const formItemLayout = {
    labelCol: {
        xs: { span: 24 },
        sm: { span: 6 },
    },
    wrapperCol: {
        xs: { span: 24 },
        sm: { span: 14 },
    },
};
const FormModal = ({ style, button, text, modalConfig = {}, formItems, onSubmit, onCancel }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form] = Form.useForm();

    const showModal = () => {
        formItems.forEach(item => {
            if (item.defaultValue !== undefined) {
                form.setFieldValue(item.name, item.defaultValue)
            }
        })
        setIsModalOpen(true);
    };

    const handleOk = () => {
        const error = onSubmit && onSubmit(form.getFieldsValue());
        if (error) {
            return message.error(error);
        }
        form.resetFields();
        setIsModalOpen(false);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        form.resetFields();
        onCancel && onCancel();
    };
    const onFinish = () => {
        form.getFieldsValue();
        // message.success('Submit success!');
    };

    const onFinishFailed = () => {
        // message.error('Submit failed!');
    };

    const renderForm = () => {

        const getElement = (item) => {
            if (item.type === 'text') return <Input />
            if (item.type === 'select') {
                const { options } = item;
                return <Select>{
                    options?.map(({ value, label }) => <Select.Option value={value}>{label}</Select.Option>)}</Select>
            }
            return <Input />
        }
        return <Form {...formItemLayout}
            form={form}
            // onFinish={onFinish}
            // onFinishFailed={onFinishFailed}
            variant="filled">
            {formItems.map(item => <Form.Item label={item.label} name={item.name} rules={[{ required: item.required, message: `请输入${item.label}` }]}>
                {getElement(item)}
            </Form.Item>)}
        </Form>
    }
    return (
        <>
            <div style={style} onClick={showModal}>
                {button ?? <Button type='primary'>{text}</Button>}
            </div>
            <Modal title={'弹窗'} {...modalConfig} open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
                {renderForm()}
            </Modal>
        </>
    );
};

export default FormModal;