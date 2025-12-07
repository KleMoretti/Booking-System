// 空状态组件
import { Empty, Button } from 'antd'
import { useNavigate } from 'react-router-dom'
import './style.css'

function EmptyState({ 
  description = '暂无数据',
  image = Empty.PRESENTED_IMAGE_SIMPLE,
  actionText,
  actionPath,
  onAction,
}) {
  const navigate = useNavigate()

  const handleAction = () => {
    if (onAction) {
      onAction()
    } else if (actionPath) {
      navigate(actionPath)
    }
  }

  return (
    <div className="empty-state">
      <Empty
        image={image}
        description={description}
      >
        {(actionText || actionPath) && (
          <Button type="primary" onClick={handleAction}>
            {actionText || '去看看'}
          </Button>
        )}
      </Empty>
    </div>
  )
}

export default EmptyState
