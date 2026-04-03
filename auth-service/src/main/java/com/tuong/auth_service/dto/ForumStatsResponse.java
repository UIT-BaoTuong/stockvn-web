package com.tuong.auth_service.dto;

public class ForumStatsResponse {
    private long totalUsers;
    private long onlineUsers;

    public ForumStatsResponse() {
    }

    public ForumStatsResponse(long totalUsers, long onlineUsers) {
        this.totalUsers = totalUsers;
        this.onlineUsers = onlineUsers;
    }

    public long getTotalUsers() {
        return totalUsers;
    }

    public void setTotalUsers(long totalUsers) {
        this.totalUsers = totalUsers;
    }

    public long getOnlineUsers() {
        return onlineUsers;
    }

    public void setOnlineUsers(long onlineUsers) {
        this.onlineUsers = onlineUsers;
    }
}