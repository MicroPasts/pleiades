library(readr)
wd <- read_tsv("../csv/wd2all.tsv")
pl <- read.csv("../csv/pleiades-places.csv")
# Rename column so merge can happen
wd$id <- wd$pleiades 
library(dplyr)
merged_df <- merge(pl, wd, by = "id", all.x = TRUE)  # Left join
merged_df_unique <- merged_df[!duplicated(merged_df$id), ]
write.csv(merged_df_unique, "../csv/enhanced.csv")