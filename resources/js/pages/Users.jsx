import { Button, Table, Tag } from 'antd'
import { PlusOutlined, EditOutlined } from '@ant-design/icons'

export default function Users() {
    const columns = [
        {
            title: '#',
            dataIndex: 'id',
            key: 'id',
            width: 60,
        },
        {
            title: 'Tên',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Role',
            dataIndex: 'role',
            key: 'role',
            render: (role) => (
                <Tag color={role === 'admin' ? 'red' : 'blue'}>
                    {role}
                </Tag>
            ),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <Tag color={status === 'active' ? 'green' : 'red'}>
                    {status === 'active' ? 'Hoạt động' : 'Vô hiệu hóa'}
                </Tag>
            ),
        },
        {
            title: 'Hành động',
            key: 'action',
            render: () => (
                <Button type="link" icon={<EditOutlined />}>
                    Sửa
                </Button>
            ),
        },
    ]

    const data = []

    return (
        <div>
            <div className="p-6 bg-white">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold m-0">Danh sách user</h2>
                    <Button type="primary" icon={<PlusOutlined />}>
                        Thêm mới
                    </Button>
                </div>
                
                <Table 
                    columns={columns} 
                    dataSource={data}
                    pagination={{ pageSize: 10 }}
                    bordered
                />
            </div>
        </div>
    )
}
