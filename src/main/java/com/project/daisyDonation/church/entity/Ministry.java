package com.project.daisyDonation.church.entity;

import com.project.daisyDonation.common.entity.TenantEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(
        name = "ministry",
        uniqueConstraints = @UniqueConstraint(columnNames = {"organization_id", "code"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Ministry extends TenantEntity {

    @Column(nullable = false, length = 255)
    private String name;

    @Column(nullable = false, length = 50)
    private String code;

    @Column(length = 2000)
    private String description;

    @Column(name = "leader_name", length = 255)
    private String leaderName;

    @Column(nullable = false)
    private boolean active = true;
}
