// 骨架屏组件
import { Skeleton as AntSkeleton, Card } from 'antd'
import './style.css'

/**
 * 表格骨架屏
 */
export const TableSkeleton = ({ rows = 5 }) => {
  return (
    <div className="table-skeleton">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="skeleton-row">
          <AntSkeleton active paragraph={{ rows: 1 }} />
        </div>
      ))}
    </div>
  )
}

/**
 * 表单骨架屏
 */
export const FormSkeleton = ({ items = 3 }) => {
  return (
    <div className="form-skeleton">
      {Array.from({ length: items }).map((_, index) => (
        <div key={index} className="skeleton-form-item">
          <AntSkeleton.Input active size="default" block />
        </div>
      ))}
    </div>
  )
}

/**
 * 卡片骨架屏
 */
export const CardSkeleton = () => {
  return (
    <Card className="card-skeleton">
      <AntSkeleton active paragraph={{ rows: 4 }} />
    </Card>
  )
}

/**
 * 通用骨架屏
 */
const Skeleton = ({ type = 'default', ...props }) => {
  switch (type) {
    case 'table':
      return <TableSkeleton {...props} />
    case 'form':
      return <FormSkeleton {...props} />
    case 'card':
      return <CardSkeleton {...props} />
    default:
      return <AntSkeleton active {...props} />
  }
}

export default Skeleton
