package com.booking.task;

import com.booking.mapper.SeatMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import javax.annotation.Resource;

/**
 * 座位锁定清理定时任务
 * 定时释放过期的锁定座位
 */
@Component
public class SeatLockCleanupTask {

    private static final Logger logger = LoggerFactory.getLogger(SeatLockCleanupTask.class);

    @Resource
    private SeatMapper seatMapper;

    /**
     * 每分钟执行一次，释放过期的锁定座位
     * 锁定时间为15分钟，每分钟检查一次可以及时释放过期座位
     */
    @Scheduled(cron = "0 * * * * ?")
    public void releaseExpiredSeats() {
        try {
            int releasedCount = seatMapper.releaseExpiredLockedSeats();
            if (releasedCount > 0) {
                logger.info("定时任务：释放了 {} 个过期锁定座位", releasedCount);
            }
        } catch (Exception e) {
            logger.error("定时任务：释放过期锁定座位失败", e);
        }
    }
}
