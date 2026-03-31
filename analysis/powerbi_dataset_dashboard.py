from pathlib import Path

import matplotlib
import matplotlib.pyplot as plt
import pandas as pd
import seaborn as sns

matplotlib.use("Agg")


BASE_DIR = Path(__file__).resolve().parent
DATASET_PATH = BASE_DIR.parent / "dataset" / "combined_final_dataset.csv"
OUTPUT_DIR = BASE_DIR / "analysis graph"


def prepare_dataset() -> pd.DataFrame:
    df = pd.read_csv(DATASET_PATH)

    numeric_columns = [
        "hand_raise",
        "resource_visits",
        "announcement_views",
        "discussion_posts",
        "free_time",
        "study_time",
        "absences",
        "final_grade",
        "total_actions",
        "video_actions",
        "audio_actions",
        "text_actions",
    ]

    for column in numeric_columns:
        if column in df.columns:
            df[column] = pd.to_numeric(df[column], errors="coerce")

    if "total_actions" in df.columns:
        missing_total = df["total_actions"].isna()
        df.loc[missing_total, "total_actions"] = (
            df.get("video_actions", 0).fillna(0)
            + df.get("audio_actions", 0).fillna(0)
            + df.get("text_actions", 0).fillna(0)
        )

    for column in ["video_actions", "audio_actions", "text_actions"]:
        if column in df.columns:
            df[column] = df[column].fillna(0)

    if "platform" in df.columns:
        df["platform"] = df["platform"].fillna("Unknown")

    return df


def create_powerbi_dashboard(df: pd.DataFrame) -> None:
    sns.set_theme(style="whitegrid")

    style_counts = df["learning_style"].fillna("Unknown").value_counts()
    avg_metrics = df[
        [
            "hand_raise",
            "resource_visits",
            "announcement_views",
            "discussion_posts",
            "study_time",
            "absences",
            "final_grade",
        ]
    ].fillna(0).mean()

    grade_bins = pd.cut(
        df["final_grade"].fillna(0),
        bins=[-1, 39, 69, 100],
        labels=["Low", "Medium", "High"],
    ).value_counts().reindex(["High", "Medium", "Low"], fill_value=0)

    fig = plt.figure(figsize=(18, 11), facecolor="#eef5ff")
    gs = fig.add_gridspec(3, 4, height_ratios=[0.9, 2.1, 2.1], hspace=0.45, wspace=0.28)

    fig.suptitle(
        "Combined Final Dataset Dashboard",
        fontsize=24,
        fontweight="bold",
        color="#16324f",
        y=0.97,
    )

    kpi_specs = [
        ("Students", len(df), "#0c67f2"),
        ("Avg Grade", f"{df['final_grade'].fillna(0).mean():.1f}", "#ff6b2c"),
        ("Avg Study Hours", f"{df['study_time'].fillna(0).mean():.1f}", "#12b886"),
        ("Avg Participation", f"{df['hand_raise'].fillna(0).mean():.1f}", "#5b58f0"),
    ]

    for idx, (label, value, color) in enumerate(kpi_specs):
        ax = fig.add_subplot(gs[0, idx])
        ax.set_facecolor(color)
        ax.set_xticks([])
        ax.set_yticks([])
        for spine in ax.spines.values():
            spine.set_visible(False)
        ax.text(0.06, 0.72, label, fontsize=13, color="white", weight="bold", transform=ax.transAxes)
        ax.text(0.06, 0.28, str(value), fontsize=28, color="white", weight="bold", transform=ax.transAxes)

    ax1 = fig.add_subplot(gs[1, 0:2])
    colors = ["#0c67f2", "#ff6b2c", "#12b886", "#5b58f0"]
    ax1.pie(
        style_counts.values,
        labels=style_counts.index,
        autopct="%1.1f%%",
        startangle=100,
        colors=colors[: len(style_counts)],
        wedgeprops={"linewidth": 1.2, "edgecolor": "white"},
        textprops={"fontsize": 11},
    )
    ax1.set_title("Learning Style Distribution", fontsize=15, fontweight="bold", color="#16324f")

    ax2 = fig.add_subplot(gs[1, 2:4])
    sns.barplot(
        x=avg_metrics.values,
        y=[name.replace("_", " ").title() for name in avg_metrics.index],
        palette=["#0c67f2", "#2ea7ff", "#ff6b2c", "#ff9d6b", "#12b886", "#f2b312", "#5b58f0"],
        ax=ax2,
    )
    ax2.set_title("Average Core Metrics", fontsize=15, fontweight="bold", color="#16324f")
    ax2.set_xlabel("Average Value")
    ax2.set_ylabel("")

    ax3 = fig.add_subplot(gs[2, 0:2])
    engagement_cols = ["hand_raise", "resource_visits", "announcement_views", "discussion_posts"]
    engagement_df = df[engagement_cols].fillna(0)
    sns.boxplot(data=engagement_df, palette=["#0c67f2", "#2ea7ff", "#12b886", "#ff6b2c"], ax=ax3)
    ax3.set_title("Engagement Spread Across Students", fontsize=15, fontweight="bold", color="#16324f")
    ax3.set_xticklabels([label.replace("_", "\n") for label in engagement_cols])
    ax3.set_ylabel("Score")

    ax4 = fig.add_subplot(gs[2, 2])
    sns.barplot(
        x=grade_bins.index,
        y=grade_bins.values,
        palette=["#12b886", "#f2b312", "#ff6b2c"],
        ax=ax4,
    )
    ax4.set_title("Performance Bands", fontsize=15, fontweight="bold", color="#16324f")
    ax4.set_xlabel("")
    ax4.set_ylabel("Students")

    ax5 = fig.add_subplot(gs[2, 3])
    media_cols = ["video_actions", "audio_actions", "text_actions"]
    media_avg = df[media_cols].fillna(0).mean()
    sns.barplot(
        x=media_avg.index.str.replace("_actions", "").str.title(),
        y=media_avg.values,
        palette=["#5b58f0", "#ff6b2c", "#0c67f2"],
        ax=ax5,
    )
    ax5.set_title("Media Interaction Averages", fontsize=15, fontweight="bold", color="#16324f")
    ax5.set_xlabel("")
    ax5.set_ylabel("Average")

    plt.tight_layout(rect=[0, 0, 1, 0.95])
    plt.savefig(OUTPUT_DIR / "powerbi_dataset_dashboard.png", dpi=300, bbox_inches="tight")
    plt.close(fig)


def create_correlation_heatmap(df: pd.DataFrame) -> None:
    numeric_df = df.select_dtypes(include=["number"]).fillna(0)
    correlation = numeric_df.corr()

    plt.figure(figsize=(13, 10), facecolor="#eef5ff")
    sns.heatmap(
        correlation,
        cmap="Blues",
        annot=True,
        fmt=".2f",
        linewidths=0.5,
        square=False,
        cbar_kws={"shrink": 0.75},
    )
    plt.title("Feature Correlation Heatmap", fontsize=18, fontweight="bold", color="#16324f", pad=16)
    plt.tight_layout()
    plt.savefig(OUTPUT_DIR / "dataset_correlation_heatmap.png", dpi=300, bbox_inches="tight")
    plt.close()


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    df = prepare_dataset()
    create_powerbi_dashboard(df)
    create_correlation_heatmap(df)
    print("Saved visualizations to:", OUTPUT_DIR)


if __name__ == "__main__":
    main()
