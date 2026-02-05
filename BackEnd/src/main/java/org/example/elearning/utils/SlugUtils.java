package org.example.elearning.utils;

import java.text.Normalizer;
import java.util.function.Function;

public class SlugUtils {


    public static String toSlug(String input) {
        if (input == null || input.trim().isEmpty()) {
            return "";
        }

        String normalized = Normalizer.normalize(input, Normalizer.Form.NFD);
        String withoutAccents = normalized.replaceAll("\\p{M}", "");

        return withoutAccents
                .toLowerCase()
                .replaceAll("[^a-z0-9\\s-]", "")  // Remove special chars
                .replaceAll("\\s+", "-")           // Replace spaces with -
                .replaceAll("-+", "-")             // Remove duplicate -
                .replaceAll("^-|-$", "");          // Remove leading/trailing -
    }


    public static String makeUnique(String slugBase, int counter) {
        return slugBase + "-" + counter;
    }

    public static String generateUniqueSlug(
            String customSlug,
            String title,
            Function<String, Boolean> existsChecker
    ) {

        if (customSlug != null && !customSlug.trim().isEmpty()) {
            String cleanSlug = customSlug.trim();


            if (!isValidSlug(cleanSlug)) {
                throw new IllegalArgumentException(
                        "Slug không hợp lệ. Chỉ được chứa chữ thường, số và dấu gạch ngang"
                );
            }

            if (existsChecker.apply(cleanSlug)) {
                throw new IllegalArgumentException("Slug đã tồn tại: " + cleanSlug);
            }

            return cleanSlug;
        }

        String slugBase = toSlug(title);
        if (slugBase.isEmpty()) {
            slugBase = "untitled";
        }

        String finalSlug = slugBase;
        int counter = 2;

        while (existsChecker.apply(finalSlug)) {
            finalSlug = makeUnique(slugBase, counter);
            counter++;
        }

        return finalSlug;
    }


    private static boolean isValidSlug(String slug) {
        return slug.matches("^[a-z0-9-]+$");
    }
}