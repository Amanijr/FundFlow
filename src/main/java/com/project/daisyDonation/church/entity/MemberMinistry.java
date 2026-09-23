package com.project.daisyDonation.church.entity;

import java.time.LocalDate;

import com.project.daisyDonation.church.entity.Member;
import com.project.daisyDonation.common.entity.TenantEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(
        name = "member_ministry",
        uniqueConstraints = @UniqueConstraint(columnNames = {"organization_id", "member_id", "ministry_id"}))
@Getter
@Setter
@NoArgsConstructor
public class MemberMinistry extends TenantEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "ministry_id", nullable = false)
    private Ministry ministry;

    @Column(length = 100)
    private String role;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private MemberMinistryStatus status = MemberMinistryStatus.ACTIVE;

    @Column(name = "joined_at")
    private LocalDate joinedAt;
}
