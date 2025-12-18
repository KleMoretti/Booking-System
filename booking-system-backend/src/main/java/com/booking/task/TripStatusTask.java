package com.booking.task;

import com.booking.mapper.TripMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

/**
 * 车次状态更新任务
 * 自动检查并更新车次状态：计划中 -> 进行中 -> 已结束
 */
@Component
public class TripStatusTask implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(TripStatusTask.class);

    @Autowired
    private TripMapper tripMapper;

    @Override
    public void run(String... args) throws Exception {
        logger.info("系统启动，开始检查车次状态...");
        updateTripStatus();
    }

    /**
     * 每分钟检查一次车次状态
     */
    @Scheduled(fixedRate = 60000)
    public void scheduledUpdate() {
        updateTripStatus();
    }

    private void updateTripStatus() {
        LocalDateTime now = LocalDateTime.now();
        
        try {
            // 1. 更新为进行中 (0 -> 1)
            // 条件：状态为0(计划中)，且 发车时间 <= 当前时间 < 到达时间
            int inProgressCount = tripMapper.updateStatusToInProgress(now);
            if (inProgressCount > 0) {
                logger.info("更新了 {} 个车次状态为进行中", inProgressCount);
            }

            // 2. 更新为已结束 (0/1 -> 2)
            // 条件：状态为0或1，且 到达时间 <= 当前时间
            int finishedCount = tripMapper.updateStatusToFinished(now);
            if (finishedCount > 0) {
                logger.info("更新了 {} 个车次状态为已结束", finishedCount);
            }
            
        } catch (Exception e) {
            logger.error("更新车次状态失败", e);
        }
    }
}
