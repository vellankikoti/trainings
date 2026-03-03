import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

interface SkillData {
  domain: string;
  compositeScore: number;
  theoryScore: number;
  labScore: number;
  quizScore: number;
  percentile: number | null;
}

interface BadgeData {
  name: string;
  tier: string;
  earnedAt: string;
}

interface PathData {
  pathSlug: string;
  completed: number;
  total: number;
  percentage: number;
}

interface CareerPDFData {
  displayName: string;
  username: string | null;
  bio: string | null;
  locationCity: string | null;
  locationCountry: string | null;
  githubUsername: string | null;
  level: number;
  levelTitle: string;
  totalXp: number;
  currentStreak: number;
  longestStreak: number;
  memberSince: string;
  lessonsCompleted: number;
  modulesCompleted: number;
  labsCompleted: number;
  quizzesAttempted: number;
  skills: SkillData[];
  badges: BadgeData[];
  paths: PathData[];
}

const colors = {
  primary: "#2563eb",
  primaryLight: "#dbeafe",
  dark: "#0f172a",
  muted: "#64748b",
  light: "#f8fafc",
  border: "#e2e8f0",
  white: "#ffffff",
  emerald: "#059669",
  amber: "#d97706",
};

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: colors.dark,
  },
  header: {
    marginBottom: 20,
    borderBottom: `2 solid ${colors.primary}`,
    paddingBottom: 16,
  },
  name: {
    fontSize: 24,
    fontFamily: "Helvetica-Bold",
    color: colors.primary,
  },
  username: {
    fontSize: 11,
    color: colors.muted,
    marginTop: 2,
  },
  bio: {
    fontSize: 10,
    color: colors.muted,
    marginTop: 6,
    lineHeight: 1.4,
  },
  metaRow: {
    flexDirection: "row",
    gap: 16,
    marginTop: 6,
  },
  metaItem: {
    fontSize: 9,
    color: colors.muted,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    marginTop: 20,
    marginBottom: 10,
    color: colors.dark,
  },
  statsGrid: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    backgroundColor: colors.light,
    border: `1 solid ${colors.border}`,
    borderRadius: 6,
    padding: 10,
    alignItems: "center",
  },
  statValue: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: colors.primary,
  },
  statLabel: {
    fontSize: 8,
    color: colors.muted,
    marginTop: 2,
  },
  skillRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 8,
    borderBottom: `1 solid ${colors.border}`,
  },
  skillName: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    width: 140,
  },
  skillScore: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    color: colors.primary,
    width: 40,
    textAlign: "right",
  },
  skillSub: {
    fontSize: 8,
    color: colors.muted,
  },
  barContainer: {
    width: 120,
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
  },
  barFill: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  badgeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  badgeTag: {
    backgroundColor: colors.primaryLight,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 8,
    color: colors.primary,
    fontFamily: "Helvetica-Bold",
  },
  pathRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 6,
    borderBottom: `1 solid ${colors.border}`,
  },
  pathName: {
    fontSize: 10,
    width: 160,
    textTransform: "capitalize",
  },
  pathPercent: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: colors.primary,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTop: `1 solid ${colors.border}`,
    paddingTop: 8,
  },
  footerText: {
    fontSize: 8,
    color: colors.muted,
  },
});

export function CareerProfilePDF(data: CareerPDFData) {
  const generatedAt = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.name}>{data.displayName}</Text>
          {data.username && (
            <Text style={styles.username}>@{data.username}</Text>
          )}
          {data.bio && <Text style={styles.bio}>{data.bio}</Text>}
          <View style={styles.metaRow}>
            {data.locationCity && (
              <Text style={styles.metaItem}>
                {data.locationCity}
                {data.locationCountry ? `, ${data.locationCountry}` : ""}
              </Text>
            )}
            {data.githubUsername && (
              <Text style={styles.metaItem}>
                github.com/{data.githubUsername}
              </Text>
            )}
            <Text style={styles.metaItem}>
              Member since{" "}
              {new Date(data.memberSince).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
              })}
            </Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>Lv {data.level}</Text>
            <Text style={styles.statLabel}>{data.levelTitle}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>
              {data.totalXp.toLocaleString()}
            </Text>
            <Text style={styles.statLabel}>Total XP</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{data.currentStreak}d</Text>
            <Text style={styles.statLabel}>Current Streak</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{data.longestStreak}d</Text>
            <Text style={styles.statLabel}>Best Streak</Text>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{data.lessonsCompleted}</Text>
            <Text style={styles.statLabel}>Lessons</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{data.modulesCompleted}</Text>
            <Text style={styles.statLabel}>Modules</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{data.labsCompleted}</Text>
            <Text style={styles.statLabel}>Labs</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{data.quizzesAttempted}</Text>
            <Text style={styles.statLabel}>Quizzes</Text>
          </View>
        </View>

        {/* Skills */}
        {data.skills.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Skill Scores</Text>
            {data.skills.map((skill) => (
              <View key={skill.domain} style={styles.skillRow}>
                <View style={{ width: 140 }}>
                  <Text style={styles.skillName}>{skill.domain}</Text>
                  <Text style={styles.skillSub}>
                    Theory: {skill.theoryScore} | Labs: {skill.labScore} | Quiz:{" "}
                    {skill.quizScore}
                  </Text>
                </View>
                <View style={styles.barContainer}>
                  <View
                    style={[
                      styles.barFill,
                      { width: `${Math.min(100, skill.compositeScore)}%` },
                    ]}
                  />
                </View>
                <Text style={styles.skillScore}>{skill.compositeScore}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Learning Paths */}
        {data.paths.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Learning Paths</Text>
            {data.paths.map((path) => (
              <View key={path.pathSlug} style={styles.pathRow}>
                <Text style={styles.pathName}>
                  {path.pathSlug.replace(/-/g, " ")}
                </Text>
                <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
                  <Text style={styles.skillSub}>
                    {path.completed}/{path.total} modules
                  </Text>
                  <Text style={styles.pathPercent}>{path.percentage}%</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Badges */}
        {data.badges.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>
              Badges ({data.badges.length})
            </Text>
            <View style={styles.badgeGrid}>
              {data.badges.map((badge, i) => (
                <View key={`${badge.name}-${i}`} style={styles.badgeTag}>
                  <Text style={styles.badgeText}>{badge.name}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            Career Profile — Generated {generatedAt}
          </Text>
          <Text style={styles.footerText}>devopsengineer.com</Text>
        </View>
      </Page>
    </Document>
  );
}
