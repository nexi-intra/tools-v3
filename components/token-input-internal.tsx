// components/TokenInputInternal.tsx
"use client";

import React, {
  useState,
  useRef,
  useEffect,
  ChangeEvent,
  KeyboardEvent,
} from "react";
import { z } from "zod";

// Define PropertyValue schema
const PropertyValueSchema = z.object({
  value: z.string(),
  icon: z.any().refine((val) => val instanceof Object || val === null, {
    message: "icon must be a valid ReactNode",
  }), // ReactNode cannot be strictly typed in Zod
  color: z.string(),
});

// Define Property schema
export const PropertySchema = z.object({
  name: z.string(),
  values: z.array(PropertyValueSchema),
});

// Derive TypeScript types from Zod schemas
export type PropertyValue = z.infer<typeof PropertyValueSchema>;
export type Property = z.infer<typeof PropertySchema>;

interface ErrorDetail {
  token: string;
  message: string;
}

interface TokenInputProps {
  properties: Property[];
  placeholder?: string;
  value: string;
  onChange: (
    value: string,
    hasErrors: boolean,
    errors: ErrorDetail[]
  ) => void;
}

type Suggestion = PropertyValue | PropertyNameSuggestion;

interface PropertyNameSuggestion {
  name: string;
}

interface Token {
  value: string;
  start: number;
  end: number;
}

const TokenInputInternal: React.FC<TokenInputProps> = ({
  properties,
  placeholder,
  value,
  onChange,
}) => {
  const [inputValue, setInputValue] = useState<string>(value);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [activeProperty, setActiveProperty] = useState<Property | null>(null);
  const [propertyTokenIndex, setPropertyTokenIndex] = useState<number | null>(
    null
  );
  const [cursorPosition, setCursorPosition] = useState<number>(0);
  const [currentTokenIndex, setCurrentTokenIndex] = useState<number | null>(
    null
  );
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState<number>(0);
  const [errors, setErrors] = useState<ErrorDetail[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Function to tokenize the input with positions, including spaces
  const tokenizeInput = (input: string): Token[] => {
    const regex = /(\s+)|"([^"]*)"|'([^']*)'|[^\s"]+/g;
    let match: RegExpExecArray | null;
    const tokens: Token[] = [];
    while ((match = regex.exec(input)) !== null) {
      tokens.push({
        value: match[0],
        start: match.index,
        end: regex.lastIndex,
      });
    }
    return tokens;
  };

  // Update tokens whenever inputValue or cursorPosition changes
  useEffect(() => {
    const tokens = tokenizeInput(inputValue);
    setTokens(tokens);
    handleAutocomplete(tokens);
    validateTokens(tokens);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputValue, cursorPosition]);

  // Handle input change
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    const position = e.target.selectionStart || 0;
    setCursorPosition(position);
  };

  // Handle cursor position change
  const handleCursorPositionChange = () => {
    const position = inputRef.current?.selectionStart || 0;
    setCursorPosition(position);
  };

  // Handle autocomplete logic
  const handleAutocomplete = (tokens: Token[]) => {
    // Find the token at the cursor position
    const currentIndex = tokens.findIndex(
      (token) => token.start <= cursorPosition && token.end >= cursorPosition
    );
    setCurrentTokenIndex(currentIndex); // Store currentTokenIndex in state

    if (currentIndex !== -1) {
      const currentToken = tokens[currentIndex];
      if (currentToken.value.trim() === "") {
        // Current token is empty or spaces
        setActiveProperty(null);
        setPropertyTokenIndex(null);
        // Suggest property names
        const typedText = currentToken.value.trim();
        const filteredSuggestions = properties
          .filter((prop) =>
            prop.name.toLowerCase().startsWith(typedText.toLowerCase())
          )
          .map((prop) => ({ name: prop.name }));
        setSuggestions(filteredSuggestions);
        setActiveSuggestionIndex(0);
      } else if (currentToken.value.includes(":")) {
        const [propertyName, ...rest] = currentToken.value.split(":");
        const property = properties.find(
          (prop) => prop.name === propertyName
        ) || null;
        const typedValue = rest.join(":"); // Handle multiple colons
        if (currentToken.value.endsWith(":")) {
          // User just typed a colon
          setActiveProperty(property);
          setSuggestions(property ? property.values : []);
          setPropertyTokenIndex(currentIndex);
          setActiveSuggestionIndex(0);
        } else if (property) {
          // Continue suggesting values
          const filteredSuggestions = property.values.filter((propValue) =>
            propValue.value.toLowerCase().startsWith(typedValue.toLowerCase())
          );
          setSuggestions(filteredSuggestions);
          setActiveProperty(property);
          setPropertyTokenIndex(currentIndex);
          setActiveSuggestionIndex(0);
        } else {
          setActiveProperty(null);
          setSuggestions([]);
          setPropertyTokenIndex(null);
        }
      } else {
        // Suggest property names while typing
        setActiveProperty(null);
        setPropertyTokenIndex(null);
        const typedText = currentToken.value;
        const filteredSuggestions = properties
          .filter((prop) =>
            prop.name.toLowerCase().startsWith(typedText.toLowerCase())
          )
          .map((prop) => ({ name: prop.name }));
        setSuggestions(filteredSuggestions);
        setActiveSuggestionIndex(0);
      }
    } else {
      // Cursor is not within any token
      setActiveProperty(null);
      setSuggestions([]);
      setPropertyTokenIndex(null);
    }
  };

  // Handle suggestion selection
  const selectSuggestion = (suggestion: Suggestion) => {
    if ("value" in suggestion) {
      // Suggestion is a PropertyValue
      if (activeProperty && propertyTokenIndex !== null) {
        const newTokens = [...tokens];
        // Combine property name and selected value to form a property token
        const combinedToken = `${activeProperty.name}:${suggestion.value}`;
        // Replace the current token with the combined token
        newTokens[propertyTokenIndex] = {
          value: combinedToken,
          start: newTokens[propertyTokenIndex].start,
          end: newTokens[propertyTokenIndex].start + combinedToken.length,
        };
        // Reconstruct the input value
        const newValue = reconstructInputValue(newTokens);
        setInputValue(newValue);
        setSuggestions([]); // Clear suggestions after selection
        setActiveProperty(null);
        setPropertyTokenIndex(null);

        // Move cursor to the end of the inserted value
        setTimeout(() => {
          const newCursorPosition = newTokens[propertyTokenIndex].end;
          inputRef.current?.setSelectionRange(
            newCursorPosition,
            newCursorPosition
          );
          setCursorPosition(newCursorPosition);
        }, 0);
      }
    } else if ("name" in suggestion) {
      // Suggestion is a property name
      const newTokens = [...tokens];
      if (currentTokenIndex !== null) {
        // Replace the current token with a leading space, the selected property name, and a colon
        const combinedToken = ` ${suggestion.name}:`;
        newTokens[currentTokenIndex] = {
          value: combinedToken,
          start: tokens[currentTokenIndex].start,
          end: tokens[currentTokenIndex].start + combinedToken.length,
        };
      } else {
        // Insert new token at cursor position
        newTokens.push({
          value: ` ${suggestion.name}:`,
          start: cursorPosition,
          end: cursorPosition + suggestion.name.length + 2, // +2 for colon and leading space
        });
      }
      // Reconstruct the input value
      const newValue = reconstructInputValue(newTokens);
      setInputValue(newValue);
      setActiveProperty(
        properties.find((prop) => prop.name === suggestion.name) || null
      );
      setSuggestions(
        properties.find((prop) => prop.name === suggestion.name)?.values || []
      );
      setActiveSuggestionIndex(0);
      setPropertyTokenIndex(currentTokenIndex);
      // Move cursor to the end of the inserted token
      setTimeout(() => {
        const newCursorPosition =
          newTokens[currentTokenIndex !== null ? currentTokenIndex : newTokens.length - 1].end;
        inputRef.current?.setSelectionRange(
          newCursorPosition,
          newCursorPosition
        );
        setCursorPosition(newCursorPosition);
      }, 0);
    }
  };

  // Handle key events for keyboard navigation
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.ctrlKey && e.key === " ") {
      // Trigger suggestions with Ctrl+Space
      e.preventDefault();
      if (activeProperty) {
        setSuggestions(activeProperty.values);
        setActiveSuggestionIndex(0);
      } else {
        // Trigger property name suggestions if no active property
        const typedText = currentTokenIndex !== null ? tokens[currentTokenIndex].value : "";
        const propertySuggestions = properties
          .filter((prop) =>
            prop.name.toLowerCase().startsWith(typedText.toLowerCase())
          )
          .map((prop) => ({ name: prop.name }));
        setSuggestions(propertySuggestions);
        setActiveSuggestionIndex(0);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (suggestions.length > 0) {
        // Navigate suggestions if they are already open
        setActiveSuggestionIndex((prevIndex) =>
          prevIndex < suggestions.length - 1 ? prevIndex + 1 : 0
        );
      } else if (activeProperty) {
        // Open suggestions if down arrow is pressed and suggestions are not visible
        setSuggestions(activeProperty.values);
        setActiveSuggestionIndex(0);
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (suggestions.length > 0) {
        setActiveSuggestionIndex((prevIndex) =>
          prevIndex > 0 ? prevIndex - 1 : suggestions.length - 1
        );
      }
    } else if (e.key === "Enter") {
      e.preventDefault();
      const suggestion = suggestions[activeSuggestionIndex];
      if (suggestion) {
        selectSuggestion(suggestion);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setSuggestions([]);
      setActiveSuggestionIndex(0);
    }
  };


  // Reconstruct the input value from tokens
  const reconstructInputValue = (tokens: Token[]): string => {
    return tokens.map((token) => token.value).join("");
  };

  // Validate tokens and collect errors
  const validateTokens = (tokens: Token[]) => {
    const errors: ErrorDetail[] = [];
    tokens.forEach((token) => {
      if (token.value.includes(":")) {
        const [propertyName, ...rest] = token.value.split(":");
        const propertyValue = rest.join(":");
        const property = properties.find(
          (prop) => prop.name === propertyName
        );
        if (property) {
          const valueObj = property.values.find(
            (val) => val.value === propertyValue
          );
          if (!valueObj) {
            errors.push({
              token: token.value,
              message: `Unknown value '${propertyValue}' for property '${propertyName}'`,
            });
          }
        } else {
          errors.push({
            token: token.value,
            message: `Unknown property '${propertyName}'`,
          });
        }
      }
      // Non-property tokens are considered valid
    });
    setErrors(errors);
    onChange(inputValue, errors.length > 0, errors);
  };

  // Common styles for input and overlay to ensure alignment
  const commonStyles: React.CSSProperties = {
    fontFamily: "inherit",
    fontSize: "1rem",
    lineHeight: "1.5",
    letterSpacing: "normal",
    padding: "0.5rem", // Match the padding in Tailwind's p-2
    boxSizing: "border-box",
  };

  return (
    <div className="relative w-full">
      <input
        type="text"
        ref={inputRef}
        placeholder={placeholder}
        className="w-full border border-gray-300 rounded focus:outline-none focus:ring"
        style={{
          ...commonStyles,
          color: "transparent",
          caretColor: "black",
          backgroundColor: "transparent",
        }}
        value={inputValue}
        onChange={handleChange}
        onClick={handleCursorPositionChange}
        onKeyUp={handleCursorPositionChange}
        onKeyDown={handleKeyDown}
        spellCheck={false} // Suppress spell checking
      />
      {/* Overlayed Text */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          ...commonStyles,
          whiteSpace: "pre-wrap",
          wordWrap: "break-word",
        }}
      >
        <div className="flex flex-wrap">
          {tokens.map((token, index) => {
            if (token.value.trim() === "") {
              // Render spaces
              return (
                <span key={index} style={{ whiteSpace: "pre" }}>
                  {token.value}
                </span>
              );
            } else if (token.value.includes(":")) {
              const [propertyName, ...rest] = token.value.split(":");
              const propertyValue = rest.join(":");
              const property = properties.find(
                (prop) => prop.name === propertyName
              );
              if (property) {
                const valueObj = property.values.find(
                  (val) => val.value === propertyValue
                );
                const isError = !valueObj;
                return (
                  <React.Fragment key={index}>
                    <span>{propertyName}:</span>
                    <span
                      style={{ color: valueObj?.color || "inherit" }}
                      className={isError ? "underline text-red-500 bg-red-100" : ""}
                    >
                      {propertyValue}
                    </span>
                  </React.Fragment>
                );
              } else {
                // Unknown property
                return (
                  <span key={index} className="underline text-red-500">
                    {token.value}
                  </span>
                );
              }
            } else {
              // Non-property token or property name without bold styling
              return <span key={index}>{token.value}</span>;
            }
          })}
        </div>
      </div>
      {/* Suggestions Dropdown */}
      {suggestions.length > 0 && (
        <ul
          className="absolute bg-white border border-gray-300 mt-1 w-full max-h-40 overflow-auto z-10"
          style={{ listStyleType: "none", paddingLeft: 0 }}
        >
          {suggestions.map((suggestion, index) => (
            <li
              key={index}
              className={`flex items-center p-2 hover:bg-gray-100 cursor-pointer ${index === activeSuggestionIndex ? "bg-gray-100" : ""
                }`}
              onClick={() => selectSuggestion(suggestion)}
            >
              {"value" in suggestion ? (
                <>
                  <span className="mr-2">{suggestion.icon}</span>
                  <span style={{ color: suggestion.color }}>
                    {suggestion.value}
                  </span>
                </>
              ) : (
                <span>{suggestion.name}</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TokenInputInternal;
